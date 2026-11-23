#Requires -Version 5.1
<#
  IRON GYM - Verificador HTTP sin modificar datos.
  Ejecutar con el backend activo: .\scripts\probar-api.ps1
  Para comprobar roles extra: .\scripts\probar-api.ps1 -TodosLosRoles
  Pide las contraseÃ±as de forma segura. Nunca imprime JWT ni passwords.
#>
param(
    [string]$ApiBase = 'http://localhost:8080/api',
    [switch]$TodosLosRoles
)
$ErrorActionPreference = 'Stop'
$ApiBase = $ApiBase.TrimEnd('/')
$ok = 0
$failed = 0

function Call-Api {
    param([string]$Path, [string]$Method = 'GET', [string]$Token = '', [object]$Body = $null)
    $options = @{
        Uri = "$ApiBase$Path"
        Method = $Method
        TimeoutSec = 12
        UseBasicParsing = $true
        ErrorAction = 'Stop'
    }
    if ($Token) { $options.Headers = @{ Authorization = "Bearer $Token" } }
    if ($null -ne $Body) {
        $options.ContentType = 'application/json; charset=utf-8'
        $options.Body = ($Body | ConvertTo-Json -Compress -Depth 6)
    }
    try {
        $data = Invoke-RestMethod @options
        return @{ Code = 200; Data = $data }
    } catch {
        $code = 0
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $code = [int]$_.Exception.Response.StatusCode
        }
        return @{ Code = $code; Data = $null; Message = $_.Exception.Message }
    }
}

function Check-Code {
    param([string]$Nombre, [object]$Result, [int]$Esperado)
    if ($Result.Code -eq $Esperado) {
        $script:ok++
        Write-Host "[OK] $Nombre ($Esperado)" -ForegroundColor Green
    } else {
        $script:failed++
        Write-Host "[FALLO] ${Nombre}: se esperaba $Esperado, se recibiÃ³ $($Result.Code)" -ForegroundColor Red
        if ($Result.Message) { Write-Host "  $($Result.Message)" }
    }
}

function Read-Credentials {
    param([string]$Role, [string]$DefaultEmail)
    $email = Read-Host "Correo de $Role [presiona Enter para $DefaultEmail]"
    if (-not $email) { $email = $DefaultEmail }
    $secure = Read-Host "ContraseÃ±a de $Role (no se muestra)" -AsSecureString
    $c = New-Object System.Management.Automation.PSCredential($email, $secure)
    return @{ Email = $email; Password = $c.GetNetworkCredential().Password }
}

Write-Host 'IRON GYM - Pruebas HTTP de integraciÃ³n' -ForegroundColor Cyan
Write-Host "API: $ApiBase"
$health = Call-Api '/health'
Check-Code 'Servicio de salud' $health 200
if ($health.Code -ne 200) {
    Write-Host 'Primero inicia Spring Boot y MySQL. Sin API no se pueden ejecutar las demÃ¡s pruebas.' -ForegroundColor Yellow
    exit 1
}

$missing = Call-Api '/auth/me'
Check-Code 'Sin JWT no hay acceso a /auth/me' $missing 401

$admin = Read-Credentials 'administrador' 'admin@irongym.local'
$badLogin = Call-Api '/auth/login' 'POST' '' @{ email = $admin.Email; password = 'ClaveIncorrectaDelTest!1234' }
Check-Code 'Credenciales invÃ¡lidas' $badLogin 401
$adminLogin = Call-Api '/auth/login' 'POST' '' @{ email = $admin.Email; password = $admin.Password }
Check-Code 'Login administrador' $adminLogin 200
$admin.Password = ''
if ($adminLogin.Code -ne 200 -or -not $adminLogin.Data.token) {
    Write-Host 'No hay JWT de administrador; revisa V2__seed.sql y la base real.' -ForegroundColor Red
    exit 1
}
$adminToken = [string]$adminLogin.Data.token
$me = Call-Api '/auth/me' 'GET' $adminToken
Check-Code 'Recuperar usuario con JWT' $me 200
Check-Code 'Dashboard administrador' (Call-Api '/dashboard/admin' 'GET' $adminToken) 200
$usersPage = Call-Api '/users?page=0&size=5&role=SOCIO' 'GET' $adminToken
Check-Code 'PÃ¡gina de socios desde Spring Boot' $usersPage 200
if ($usersPage.Code -eq 200) {
    if ($null -ne $usersPage.Data.content -and @($usersPage.Data.content).Count -le 5) {
        $script:ok++
        Write-Host '[OK] La pÃ¡gina contiene como mÃ¡ximo cinco registros' -ForegroundColor Green
    } else {
        $script:failed++
        Write-Host '[FALLO] La respuesta no tiene la forma paginada esperada' -ForegroundColor Red
    }
}
Check-Code 'Consulta de pagos del administrador' (Call-Api '/payments?page=0&size=5' 'GET' $adminToken) 200

if ($TodosLosRoles) {
    $trainer = Read-Credentials 'entrenador' 'coach@irongym.local'
    $res = Call-Api '/auth/login' 'POST' '' @{ email = $trainer.Email; password = $trainer.Password }
    Check-Code 'Login entrenador' $res 200
    if ($res.Data.token) {
        $t = [string]$res.Data.token
        Check-Code 'Panel entrenador' (Call-Api '/dashboard/trainer' 'GET' $t) 200
        Check-Code 'Entrenador sin acceso a cobros' (Call-Api '/payments' 'GET' $t) 403
    }
    $trainer.Password = ''

    $member = Read-Credentials 'socio' 'ana.lopez@irongym.local'
    $res = Call-Api '/auth/login' 'POST' '' @{ email = $member.Email; password = $member.Password }
    Check-Code 'Login socio' $res 200
    if ($res.Data.token) {
        $t = [string]$res.Data.token
        Check-Code 'Panel socio' (Call-Api '/dashboard/member' 'GET' $t) 200
        Check-Code 'Solo pagos propios' (Call-Api '/payments/mine' 'GET' $t) 200
        Check-Code 'Solo membresÃ­as propias' (Call-Api '/memberships/mine' 'GET' $t) 200
        Check-Code 'Socio sin acceso a usuarios' (Call-Api '/users' 'GET' $t) 403
    }
    $member.Password = ''
}

Check-Code 'Cierre de sesiÃ³n' (Call-Api '/auth/logout' 'POST' $adminToken) 200
Check-Code 'JWT revocado despuÃ©s del logout' (Call-Api '/auth/me' 'GET' $adminToken) 401
$adminToken = ''

Write-Host "RESULTADO: $ok correctas; $failed fallidas." -ForegroundColor Cyan
if ($failed -gt 0) { exit 1 }
exit 0

