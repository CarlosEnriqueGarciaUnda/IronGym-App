package mx.edu.ito.irongym.service;

import mx.edu.ito.irongym.exception.ApiException;
import mx.edu.ito.irongym.model.*;
import mx.edu.ito.irongym.repo.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.*;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
@Transactional
public class NotificationService {
    private final MembershipService members;
    private final JavaMailSender mail;
    private final NotificationLogRepository logs;
    @Value("${irongym.mail.enabled:false}")
    private boolean mailEnabled;
    @Value("${irongym.mail.from}")
    private String mailFrom;
    @Value("${irongym.twilio.enabled:false}")
    private boolean twilioEnabled;
    @Value("${irongym.twilio.account-sid:}")
    private String sid;
    @Value("${irongym.twilio.auth-token:}")
    private String token;
    @Value("${irongym.twilio.sms-from:}")
    private String smsFrom;
    @Value("${irongym.twilio.whatsapp-from:}")
    private String waFrom;
    public NotificationService(MembershipService members, JavaMailSender mail, NotificationLogRepository logs) {
        this.members = members;
        this.mail = mail;
        this.logs = logs;
    }
    public Map<String, String> notifyMember(Long membershipId, String channel) {
        Membership m = members.require(membershipId);
        String type = channel.toUpperCase(Locale.ROOT);
        if (!List.of("EMAIL", "SMS", "WHATSAPP").contains(type)) throw new ApiException(HttpStatus.BAD_REQUEST, "Canal inválido");
        String text = "IRON GYM: Hola " + m.getUser().getName() + ", tu membresía " + m.getPlan().getName() + " vence el " + m.getEndDate() + ". Acude a recepción para renovar.";
        try {
            switch (type) {
                case "EMAIL" -> {
                    if (!mailEnabled) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Postfix/correo no configurado");
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(mailFrom);
                    msg.setTo(m.getUser().getEmail());
                    msg.setSubject("IRON GYM | Aviso de membresía");
                    msg.setText(text);
                    mail.send(msg);
                }
                case "SMS" -> sendTwilio(normalizePhone(m.getUser().getPhone()), smsFrom, text);
                case "WHATSAPP" -> sendTwilio("whatsapp:" + normalizePhone(m.getUser().getPhone()), waFrom, text);
            }
            log(m.getUser(), type, "ENVIADO", text);
            return Map.of("message", "Notificación enviada por " + type);
        }
        catch (ApiException e) {
            throw e;
        }
        catch (Exception e) {
            log(m.getUser(), type, "ERROR", text);
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "No se pudo enviar: revisa credenciales, número y permisos del proveedor");
        }
    }
    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El socio no tiene teléfono");
        String digits = phone.replaceAll("[^0-9+]", "");
        return digits.startsWith("+")?digits:digits.length() == 10?"+52" + digits:digits;
    }
    private void sendTwilio(String to, String from, String body)throws Exception {
        if (!twilioEnabled || sid.isBlank() || token.isBlank() || from.isBlank()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Twilio aún no configurado");
        if (to == null || to.isBlank()) throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "El socio no tiene teléfono");
        String form = "To=" + enc(to) + "&From=" + enc(from) + "&Body=" + enc(body);
        String basic = Base64.getEncoder().encodeToString((sid + ":" + token).getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + enc(sid) + "/Messages.json")) .header("Authorization", "Basic " + basic).header("Content-Type", "application/x-www-form-urlencoded") .timeout(Duration.ofSeconds(12)).POST(HttpRequest.BodyPublishers.ofString(form)).build();
        HttpResponse<String> result = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
        if (result.statusCode()<200 || result.statusCode()>299) throw new IllegalStateException("Twilio respondió HTTP " + result.statusCode());
    }
    private String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
    private void log(User user, String channel, String status, String message) {
        NotificationLog n = new NotificationLog();
        n.setUser(user);
        n.setChannel(channel);
        n.setStatus(status);
        n.setMessage(message);
        logs.save(n);
    }
}
