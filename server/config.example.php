<?php 



# *******************************
# Mail
# *******************************
define("POS_MAIL_SMTP_HOST", 		"mail.caffeina.mx");
define("POS_MAIL_SMTP_USERNAME", 	"facturas@caffeina.mx");
define("POS_MAIL_SMTP_PASSWORD", 	"");
define("POS_MAIL_SMTP_PORT", 		"26");
define("POS_MAIL_SMTP_FROM", 		"facturas@caffeina.mx");


# *******************************
# Logs
# *******************************
# habilitar los logs
define("POS_LOG_TO_FILE", true);

# archivo donde se guardaran los logs
define("POS_LOG_TO_FILE_FILENAME", "/var/log/mx.caffeina.pos/pos.log");
define("POS_LOG_TRACKBACK", false);
define("POS_LOG_DB_QUERYS", false);

# *******************************
# FACTURACION
# *******************************
define("POS_FACTURACION_PRODUCCION", false);
define("POS_FACTURACION_ALL", false);

# *******************************
# ZONA HORARIA
# *******************************
date_default_timezone_set("America/Mexico_City");

# ******************************
# BASE DE DATOS 
# ******************************
define('POS_CORE_DB_USER',       'root');
define('POS_CORE_DB_PASSWORD',   '');
define('POS_CORE_DB_NAME',       'pos_core');
define('POS_CORE_DB_DRIVER',     'mysqlt');
define('POS_CORE_DB_HOST',       'localhost');
define('POS_CORE_DB_DEBUG',      false);


# *******************************
# Seguridad
# *******************************
#cada que una sesion sobrepase de este valor, volvera a pedir las credenciales
$__ADMIN_TIME_OUT 	= 3600;
$__GERENTE_TIME_OUT = 3600;
$__CAJERO_TIME_OUT 	= 3600;









