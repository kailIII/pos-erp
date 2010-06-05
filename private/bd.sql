# phpMyAdmin SQL Dump
# version 3.1.1
# http://www.phpmyadmin.net
#
# Servidor: localhost
# Tiempo de generaci�n: 02-06-2010 a las 23:08:48
# Versi�n del servidor: 5.1.30
# Versi�n de PHP: 5.2.8

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

# ############################

#
# Estructura de tabla para la tabla `cliente`
#

DROP TABLE IF EXISTS `cliente`;
CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` int(11) NOT NULL COMMENT 'identificador del cliente',
  `rfc` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'rfc del cliente si es que tiene',
  `nombre` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'nombre del cliente',
  `direccion` varchar(300) COLLATE utf8_unicode_ci NOT NULL COMMENT 'domicilio del cliente calle, no, colonia',
  `telefono` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Telefono del cliete',
  `e_mail` varchar(60) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0' COMMENT 'dias de credito para que pague el cliente',
  `limite_credito` float NOT NULL DEFAULT '0' COMMENT 'Limite de credito otorgado al cliente',
  PRIMARY KEY (`id_cliente`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `compras`
#

DROP TABLE IF EXISTS `compras`;
CREATE TABLE IF NOT EXISTS `compras` (
  `id_compra` int(11) NOT NULL COMMENT 'id de la compra',
  `id_proveedor` int(11) NOT NULL COMMENT 'PROVEEDOR AL QUE SE LE COMPRO',
  `tipo_compra` int(11) NOT NULL COMMENT 'tipo de compra, contado o credito',
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'fecha de compra',
  `subtotal` float NOT NULL COMMENT 'subtotal de compra',
  `iva` float NOT NULL COMMENT 'iva de la compra',
  `sucursal` int(11) NOT NULL COMMENT 'sucursal en que se compro',
  `id_usuario` int(11) NOT NULL COMMENT 'quien realizo la compra',
  PRIMARY KEY (`id_compra`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `cotizacion`
#

DROP TABLE IF EXISTS `cotizacion`;
CREATE TABLE IF NOT EXISTS `cotizacion` (
  `id_cotizacion` int(11) NOT NULL COMMENT 'id de la cotizacion',
  `id_cliente` int(11) NOT NULL COMMENT 'id del cliente',
  `fecha` date NOT NULL COMMENT 'fecha de cotizacion',
  `subtotal` float NOT NULL COMMENT 'subtotal de la cotizacion',
  `iva` float NOT NULL COMMENT 'iva sobre el subtotal',
  PRIMARY KEY (`id_cotizacion`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

# ############################

#
# Estructura de tabla para la tabla `cuenta_cliente`
#

DROP TABLE IF EXISTS `cuenta_cliente`;
CREATE TABLE IF NOT EXISTS `cuenta_cliente` (
  `id_cliente` int(11) NOT NULL COMMENT 'id del cliente',
  `saldo` int(11) NOT NULL COMMENT 'saldo del cliente',
  PRIMARY KEY (`id_cliente`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `cuenta_proveedor`
#

DROP TABLE IF EXISTS `cuenta_proveedor`;
CREATE TABLE IF NOT EXISTS `cuenta_proveedor` (
  `id_proveedor` int(11) NOT NULL COMMENT 'id del proveedor al que le debemos',
  `saldo` float NOT NULL COMMENT 'cantidad que adeudamos al proveedor',
  PRIMARY KEY (`id_proveedor`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

# ############################

#
# Estructura de tabla para la tabla `detalle_compra`
#

DROP TABLE IF EXISTS `detalle_compra`;
CREATE TABLE IF NOT EXISTS `detalle_compra` (
  `id_compra` int(11) NOT NULL COMMENT 'id de la compra',
  `id_producto` int(11) NOT NULL COMMENT 'id del producto',
  `cantidad` float NOT NULL COMMENT 'cantidad comprada',
  `precio` float NOT NULL COMMENT 'costo de compra',
  PRIMARY KEY (`id_compra`,`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `detalle_cotizacion`
#

DROP TABLE IF EXISTS `detalle_cotizacion`;
CREATE TABLE IF NOT EXISTS `detalle_cotizacion` (
  `id_cotizacion` int(11) NOT NULL COMMENT 'id de la cotizacion',
  `id_producto` int(11) NOT NULL COMMENT 'id del producto',
  `cantidad` float NOT NULL COMMENT 'cantidad cotizado',
  `precio` float NOT NULL COMMENT 'precio al que cotizo el producto',
  PRIMARY KEY (`id_cotizacion`,`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

# ############################

#
# Estructura de tabla para la tabla `detalle_venta`
#

DROP TABLE IF EXISTS `detalle_venta`;
CREATE TABLE IF NOT EXISTS `detalle_venta` (
  `id_venta` int(11) NOT NULL COMMENT 'venta a que se referencia',
  `id_producto` int(11) NOT NULL COMMENT 'producto de la venta',
  `cantidad` float NOT NULL COMMENT 'cantidad que se vendio',
  `precio` float NOT NULL COMMENT 'precio al que se vendio',
  PRIMARY KEY (`id_venta`,`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `factura_compra`
#

DROP TABLE IF EXISTS `factura_compra`;
CREATE TABLE IF NOT EXISTS `factura_compra` (
  `id_factura` int(20) NOT NULL AUTO_INCREMENT COMMENT 'NUMERO DE FACTURA',
  `folio` varchar(15) COLLATE utf8_unicode_ci NOT NULL,
  `id_compra` int(11) NOT NULL COMMENT 'COMPRA A LA QUE CORRESPONDE LA FACTURA',
  PRIMARY KEY (`id_factura`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `factura_venta`
#

DROP TABLE IF EXISTS `factura_venta`;
CREATE TABLE IF NOT EXISTS `factura_venta` (
  `id_factura` int(20) NOT NULL AUTO_INCREMENT COMMENT 'Numero de factura al cliente',
  `folio` varchar(15) COLLATE utf8_unicode_ci NOT NULL COMMENT 'folio que tiene la factura',
  `id_venta` int(11) NOT NULL COMMENT 'venta a la cual corresponde la factura',
  PRIMARY KEY (`id_factura`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `impuesto`
#

DROP TABLE IF EXISTS `impuesto`;
CREATE TABLE IF NOT EXISTS `impuesto` (
  `id_impuesto` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `valor` int(11) NOT NULL,
  PRIMARY KEY (`id_impuesto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `inventario`
#

DROP TABLE IF EXISTS `inventario`;
CREATE TABLE IF NOT EXISTS `inventario` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id del producto',
  `nombre` varchar(90) COLLATE utf8_unicode_ci NOT NULL COMMENT 'Descripcion o nombre del producto',
  `precio_venta` float NOT NULL COMMENT 'precio al que se vende el producto',
  `existencia` float NOT NULL COMMENT 'total del producto en la sucursal',
  `sucursal` int(11) NOT NULL COMMENT 'sucursal en la que tenemos el prodcto',
  PRIMARY KEY (`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `nota_remision`
#

DROP TABLE IF EXISTS `nota_remision`;
CREATE TABLE IF NOT EXISTS `nota_remision` (
  `id_nota` int(11) NOT NULL AUTO_INCREMENT COMMENT 'numero de nota a clienes',
  `id_venta` int(11) NOT NULL COMMENT 'venta a la cual corresponde la nota',
  PRIMARY KEY (`id_nota`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `pagos_compra`
#

DROP TABLE IF EXISTS `pagos_compra`;
CREATE TABLE IF NOT EXISTS `pagos_compra` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT COMMENT 'identificador del pago',
  `id_compra` int(11) NOT NULL COMMENT 'identificador de la compra a la que pagamos',
  `fecha` date NOT NULL COMMENT 'fecha en que se abono',
  `monto` float NOT NULL COMMENT 'monto que se abono',
  PRIMARY KEY (`id_pago`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `pagos_venta`
#

DROP TABLE IF EXISTS `pagos_venta`;
CREATE TABLE IF NOT EXISTS `pagos_venta` (
  `id_pago` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id de pago del cliente',
  `id_venta` int(11) NOT NULL COMMENT 'id de la venta a la que se esta pagando',
  `monto` float NOT NULL COMMENT 'total de credito del cliente',
  `fecha` date NOT NULL COMMENT 'fecha de vencimiento para el pago',
  PRIMARY KEY (`id_pago`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `productos_proveedor`
#

DROP TABLE IF EXISTS `productos_proveedor`;
CREATE TABLE IF NOT EXISTS `productos_proveedor` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT COMMENT 'identificador del producto',
  `clave_producto` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'clave de producto para el proveedor',
  `id_proveedor` int(11) NOT NULL COMMENT 'clave del proveedor',
  `id_inventario` int(11) NOT NULL COMMENT 'clave con la que entra a nuestro inventario',
  `precio` int(11) NOT NULL COMMENT 'precio al que se compra el producto (sin descuento)',
  PRIMARY KEY (`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `proveedor`
#

DROP TABLE IF EXISTS `proveedor`;
CREATE TABLE IF NOT EXISTS `proveedor` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT COMMENT 'identificador del proveedor',
  `rfc` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT 'rfc del proveedor',
  `nombre` varchar(30) COLLATE utf8_unicode_ci NOT NULL COMMENT 'nombre del proveedor',
  `direccion` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'direccion del proveedor',
  `telefono` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'telefono',
  `e_mail` varchar(60) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'email del provedor',
  PRIMARY KEY (`id_proveedor`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `sucursal`
#

DROP TABLE IF EXISTS `sucursal`;
CREATE TABLE IF NOT EXISTS `sucursal` (
  `id_sucursal` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador de cada sucursal',
  `descripcion` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'nombre o descripcion de sucursal',
  `direccion` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'direccion de la sucursal',
  PRIMARY KEY (`id_sucursal`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1 ;

# ############################

#
# Estructura de tabla para la tabla `usuario`
#

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` int(11) NOT NULL COMMENT 'identificador del usuario',
  `nombre` varchar(100) COLLATE utf8_unicode_ci NOT NULL COMMENT 'nombre del empleado',
  `usuario` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `contrasena` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `nivel` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ############################

#
# Estructura de tabla para la tabla `ventas`
#

DROP TABLE IF EXISTS `ventas`;
CREATE TABLE IF NOT EXISTS `ventas` (
  `id_venta` int(11) NOT NULL COMMENT 'id de venta',
  `id_cliente` int(11) NOT NULL COMMENT 'cliente al que se le vendio',
  `tipo_venta` int(11) NOT NULL COMMENT 'tipo de venta, contado o credito',
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'fecha de venta',
  `subtotal` float NOT NULL COMMENT 'subtotal de la venta',
  `iva` float NOT NULL COMMENT 'iva agregado por la venta',
  `id_sucursal` int(11) NOT NULL COMMENT 'sucursal de la venta',
  `id_usuario` int(11) NOT NULL COMMENT 'empleado que lo vendio',
  PRIMARY KEY (`id_venta`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;



#aqui van las llaves foraneas
#tabla compras
ALTER TABLE compras DROP FOREIGN KEY compras_proveedor;

alter table compras
add CONSTRAINT compras_proveedor FOREIGN KEY (id_proveedor)
REFERENCES  proveedores(id_proveedor);

ALTER TABLE compras DROP FOREIGN KEY compras_sucursal;

alter table compras
add CONSTRAINT compras_sucursal FOREIGN KEY (sucursal)
REFERENCES  sucursal(id_sucursal);

ALTER TABLE compras DROP FOREIGN KEY compras_usuario;

alter table compras
add CONSTRAINT compras_usuario FOREIGN KEY (id_usuario)
REFERENCES  usuario(id_usuario);

# tabla cotizacion

ALTER TABLE cotizacion DROP FOREIGN KEY cotizacion_cliente;

alter table cotizacion
add CONSTRAINT cotizacion_cliente FOREIGN KEY (id_cliente)
REFERENCES  cliente(id_cliente);

#tabla cuenta_cliente

ALTER TABLE cuenta_cliente  DROP FOREIGN KEY cuenta_de_cliente;

alter table cuenta_cliente
add CONSTRAINT cuenta_de_cliente FOREIGN KEY (id_cliente)
REFERENCES  cliente(id_cliente);

#tabla cuenta proveedor

ALTER TABLE cuenta_proveedor DROP FOREIGN KEY cuenta_de_proveedor;

alter table cuenta_proveedor
add CONSTRAINT cuenta_de_proveedor FOREIGN KEY (id_proveedor)
REFERENCES  proveedor(id_proveedor);

#tabla detalle compra

ALTER TABLE detalle_compra DROP FOREIGN KEY detalle_compra_compra;

alter table detalle_compra
add CONSTRAINT detalle_compra_compra FOREIGN KEY (id_compra)
REFERENCES  compras(id_compra);

ALTER TABLE detalle_compra DROP FOREIGN KEY detalle_compra_producto;

alter table detalle_compra
add CONSTRAINT detalle_compra_producto FOREIGN KEY (id_producto)
REFERENCES  productos_proveedor(id_producto);

#tabla detalle cotizacion
ALTER TABLE detalle_cotizacion DROP FOREIGN KEY detalle_cotizacion_cotizacion;

alter table detalle_cotizacion
add CONSTRAINT detalle_cotizacion_cotizacion FOREIGN KEY (id_cotizacion)
REFERENCES cotizacion(id_cotizacion);

ALTER TABLE detalle_cotizacion DROP FOREIGN KEY detalle_cotizacion_producto;

alter table detalle_cotizacion
add CONSTRAINT detalle_cotizacion_producto FOREIGN KEY (id_producto)
REFERENCES  inventario(id_producto);

#tabla detalle venta
ALTER TABLE detalle_venta DROP FOREIGN KEY detalle_venta_venta;

alter table detalle_venta
add CONSTRAINT detalle_venta_venta FOREIGN KEY (id_venta)
REFERENCES  ventas(id_venta);

ALTER TABLE detalle_venta DROP FOREIGN KEY detalle_venta_producto;

alter table detalle_venta
add CONSTRAINT detalle_venta_producto FOREIGN KEY (id_producto)
REFERENCES  inventario(id_producto);


#tabla factura compra

ALTER TABLE factura_compra DROP FOREIGN KEY factura_compra_compra;

alter table factura_compra
add CONSTRAINT factura_compra_compra FOREIGN KEY (id_compra)
REFERENCES  compras(id_compra);

#tabla factura venta

ALTER TABLE factura_venta DROP FOREIGN KEY factura_venta_venta;

alter table factura_venta
add CONSTRAINT factura_venta_venta FOREIGN KEY (id_venta)
REFERENCES  ventas(id_venta);

#tabla inventario

ALTER TABLE inventario DROP FOREIGN KEY inventario_sucursal;

alter table inventario
add CONSTRAINT inventario_sucursal FOREIGN KEY (sucursal)
REFERENCES  sucursal(id_sucursal);

#tabla nota_remision

ALTER TABLE nota_remision DROP FOREIGN KEY nota_remision_venta;

alter table nota_remision
add CONSTRAINT nota_remision_venta FOREIGN KEY (id_venta)
REFERENCES  ventas(id_venta);

#tabla pagos_compra
ALTER TABLE pagos_compra DROP FOREIGN KEY pagos_compra_compra ;

alter table pagos_compra
add CONSTRAINT pagos_compra_compra FOREIGN KEY (id_compra)
REFERENCES  compras(id_compra);

#tabla pagos_venta

ALTER TABLE pagos_venta DROP FOREIGN KEY pagos_venta_venta;

alter table pagos_venta
add CONSTRAINT pagos_venta_venta FOREIGN KEY (id_venta)
REFERENCES  ventas(id_venta);

#tabla productos_proveedor

ALTER TABLE productos_proveedor DROP FOREIGN KEY productos_proveedor_proveedor;

alter table productos_proveedor
add CONSTRAINT productos_proveedor_proveedor FOREIGN KEY (id_proveedor)
REFERENCES  proveedor(id_proveedor);

ALTER TABLE productos_proveedor DROP FOREIGN KEY productos_proveedor_producto;

alter table productos_proveedor
add CONSTRAINT productos_proveedor_producto FOREIGN KEY (id_inventario)
REFERENCES  inventario(id_producto);

#tabla ventas


ALTER TABLE ventas DROP FOREIGN KEY ventas_cliente;

alter table ventas
add CONSTRAINT ventas_cliente  FOREIGN KEY (id_cliente)
REFERENCES  clientes(id_cliente);

ALTER TABLE ventas DROP FOREIGN KEY ventas_sucursal;

alter table ventas
add CONSTRAINT ventas_sucursal FOREIGN KEY (id_sucursal)
REFERENCES  sucursal(id_sucursal);

ALTER TABLE ventas DROP FOREIGN KEY ventas_usuario;

alter table ventas
add CONSTRAINT ventas_usuario FOREIGN KEY (id_usuario)
REFERENCES  usuario(id_usuario);



