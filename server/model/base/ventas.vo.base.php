<?php
/** Value Object file for table ventas.
  * 
  * VO does not have any behaviour except for storage and retrieval of its own data (accessors and mutators).
  * @author caffeina
  * @access public
  * @package docs
  * 
  */

class Ventas extends VO
{
	/**
	  * Constructor de Ventas
	  * 
	  * Para construir un objeto de tipo Ventas debera llamarse a el constructor 
	  * sin parametros. Es posible, construir un objeto pasando como parametro un arreglo asociativo 
	  * cuyos campos son iguales a las variables que constituyen a este objeto.
	  * @return Ventas
	  */
	function __construct( $data = NULL)
	{ 
		if(isset($data))
		{
			if( isset($data['id_venta']) ){
				$this->id_venta = $data['id_venta'];
			}
			if( isset($data['id_venta_equipo']) ){
				$this->id_venta_equipo = $data['id_venta_equipo'];
			}
			if( isset($data['id_equipo']) ){
				$this->id_equipo = $data['id_equipo'];
			}
			if( isset($data['id_cliente']) ){
				$this->id_cliente = $data['id_cliente'];
			}
			if( isset($data['tipo_venta']) ){
				$this->tipo_venta = $data['tipo_venta'];
			}
			if( isset($data['tipo_pago']) ){
				$this->tipo_pago = $data['tipo_pago'];
			}
			if( isset($data['fecha']) ){
				$this->fecha = $data['fecha'];
			}
			if( isset($data['subtotal']) ){
				$this->subtotal = $data['subtotal'];
			}
			if( isset($data['iva']) ){
				$this->iva = $data['iva'];
			}
			if( isset($data['descuento']) ){
				$this->descuento = $data['descuento'];
			}
			if( isset($data['total']) ){
				$this->total = $data['total'];
			}
			if( isset($data['id_sucursal']) ){
				$this->id_sucursal = $data['id_sucursal'];
			}
			if( isset($data['id_usuario']) ){
				$this->id_usuario = $data['id_usuario'];
			}
			if( isset($data['pagado']) ){
				$this->pagado = $data['pagado'];
			}
			if( isset($data['cancelada']) ){
				$this->cancelada = $data['cancelada'];
			}
			if( isset($data['ip']) ){
				$this->ip = $data['ip'];
			}
			if( isset($data['liquidada']) ){
				$this->liquidada = $data['liquidada'];
			}
		}
	}

	/**
	  * Obtener una representacion en String
	  * 
	  * Este metodo permite tratar a un objeto Ventas en forma de cadena.
	  * La representacion de este objeto en cadena es la forma JSON (JavaScript Object Notation) para este objeto.
	  * @return String 
	  */
	public function __toString( )
	{ 
		$vec = array( 
			"id_venta" => $this->id_venta,
			"id_venta_equipo" => $this->id_venta_equipo,
			"id_equipo" => $this->id_equipo,
			"id_cliente" => $this->id_cliente,
			"tipo_venta" => $this->tipo_venta,
			"tipo_pago" => $this->tipo_pago,
			"fecha" => $this->fecha,
			"subtotal" => $this->subtotal,
			"iva" => $this->iva,
			"descuento" => $this->descuento,
			"total" => $this->total,
			"id_sucursal" => $this->id_sucursal,
			"id_usuario" => $this->id_usuario,
			"pagado" => $this->pagado,
			"cancelada" => $this->cancelada,
			"ip" => $this->ip,
			"liquidada" => $this->liquidada
		); 
	return json_encode($vec); 
	}
	
	/**
	  * id_venta
	  * 
	  * id de venta<br>
	  * <b>Llave Primaria</b><br>
	  * <b>Auto Incremento</b><br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_venta;

	/**
	  * id_venta_equipo
	  * 
	  *  [Campo no documentado]<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_venta_equipo;

	/**
	  * id_equipo
	  * 
	  *  [Campo no documentado]<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_equipo;

	/**
	  * id_cliente
	  * 
	  * cliente al que se le vendio<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_cliente;

	/**
	  * tipo_venta
	  * 
	  * tipo de venta, contado o credito<br>
	  * @access protected
	  * @var enum('credito','contado')
	  */
	protected $tipo_venta;

	/**
	  * tipo_pago
	  * 
	  * tipo de pago para esta venta en caso de ser a contado<br>
	  * @access protected
	  * @var enum('efectivo','cheque','tarjeta')
	  */
	protected $tipo_pago;

	/**
	  * fecha
	  * 
	  * fecha de venta<br>
	  * @access protected
	  * @var timestamp
	  */
	protected $fecha;

	/**
	  * subtotal
	  * 
	  * subtotal de la venta, puede ser nulo<br>
	  * @access protected
	  * @var float
	  */
	protected $subtotal;

	/**
	  * iva
	  * 
	  * iva agregado por la venta, depende de cada sucursal<br>
	  * @access protected
	  * @var float
	  */
	protected $iva;

	/**
	  * descuento
	  * 
	  * descuento aplicado a esta venta<br>
	  * @access protected
	  * @var float
	  */
	protected $descuento;

	/**
	  * total
	  * 
	  * total de esta venta<br>
	  * @access protected
	  * @var float
	  */
	protected $total;

	/**
	  * id_sucursal
	  * 
	  * sucursal de la venta<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_sucursal;

	/**
	  * id_usuario
	  * 
	  * empleado que lo vendio<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_usuario;

	/**
	  * pagado
	  * 
	  * porcentaje pagado de esta venta<br>
	  * @access protected
	  * @var float
	  */
	protected $pagado;

	/**
	  * cancelada
	  * 
	  * verdadero si esta venta ha sido cancelada, falso si no<br>
	  * @access protected
	  * @var tinyint(1)
	  */
	protected $cancelada;

	/**
	  * ip
	  * 
	  * ip de donde provino esta compra<br>
	  * @access protected
	  * @var varchar(16)
	  */
	protected $ip;

	/**
	  * liquidada
	  * 
	  * Verdadero si esta venta ha sido liquidada, falso si hay un saldo pendiente<br>
	  * @access protected
	  * @var tinyint(1)
	  */
	protected $liquidada;

	/**
	  * getIdVenta
	  * 
	  * Get the <i>id_venta</i> property for this object. Donde <i>id_venta</i> es id de venta
	  * @return int(11)
	  */
	final public function getIdVenta()
	{
		return $this->id_venta;
	}

	/**
	  * setIdVenta( $id_venta )
	  * 
	  * Set the <i>id_venta</i> property for this object. Donde <i>id_venta</i> es id de venta.
	  * Una validacion basica se hara aqui para comprobar que <i>id_venta</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * <br><br>Esta propiedad se mapea con un campo que es de <b>Auto Incremento</b> !<br>
	  * No deberias usar setIdVenta( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * <br><br>Esta propiedad se mapea con un campo que es una <b>Llave Primaria</b> !<br>
	  * No deberias usar setIdVenta( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * @param int(11)
	  */
	final public function setIdVenta( $id_venta )
	{
		$this->id_venta = $id_venta;
	}

	/**
	  * getIdVentaEquipo
	  * 
	  * Get the <i>id_venta_equipo</i> property for this object. Donde <i>id_venta_equipo</i> es  [Campo no documentado]
	  * @return int(11)
	  */
	final public function getIdVentaEquipo()
	{
		return $this->id_venta_equipo;
	}

	/**
	  * setIdVentaEquipo( $id_venta_equipo )
	  * 
	  * Set the <i>id_venta_equipo</i> property for this object. Donde <i>id_venta_equipo</i> es  [Campo no documentado].
	  * Una validacion basica se hara aqui para comprobar que <i>id_venta_equipo</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdVentaEquipo( $id_venta_equipo )
	{
		$this->id_venta_equipo = $id_venta_equipo;
	}

	/**
	  * getIdEquipo
	  * 
	  * Get the <i>id_equipo</i> property for this object. Donde <i>id_equipo</i> es  [Campo no documentado]
	  * @return int(11)
	  */
	final public function getIdEquipo()
	{
		return $this->id_equipo;
	}

	/**
	  * setIdEquipo( $id_equipo )
	  * 
	  * Set the <i>id_equipo</i> property for this object. Donde <i>id_equipo</i> es  [Campo no documentado].
	  * Una validacion basica se hara aqui para comprobar que <i>id_equipo</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdEquipo( $id_equipo )
	{
		$this->id_equipo = $id_equipo;
	}

	/**
	  * getIdCliente
	  * 
	  * Get the <i>id_cliente</i> property for this object. Donde <i>id_cliente</i> es cliente al que se le vendio
	  * @return int(11)
	  */
	final public function getIdCliente()
	{
		return $this->id_cliente;
	}

	/**
	  * setIdCliente( $id_cliente )
	  * 
	  * Set the <i>id_cliente</i> property for this object. Donde <i>id_cliente</i> es cliente al que se le vendio.
	  * Una validacion basica se hara aqui para comprobar que <i>id_cliente</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdCliente( $id_cliente )
	{
		$this->id_cliente = $id_cliente;
	}

	/**
	  * getTipoVenta
	  * 
	  * Get the <i>tipo_venta</i> property for this object. Donde <i>tipo_venta</i> es tipo de venta, contado o credito
	  * @return enum('credito','contado')
	  */
	final public function getTipoVenta()
	{
		return $this->tipo_venta;
	}

	/**
	  * setTipoVenta( $tipo_venta )
	  * 
	  * Set the <i>tipo_venta</i> property for this object. Donde <i>tipo_venta</i> es tipo de venta, contado o credito.
	  * Una validacion basica se hara aqui para comprobar que <i>tipo_venta</i> es de tipo <i>enum('credito','contado')</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param enum('credito','contado')
	  */
	final public function setTipoVenta( $tipo_venta )
	{
		$this->tipo_venta = $tipo_venta;
	}

	/**
	  * getTipoPago
	  * 
	  * Get the <i>tipo_pago</i> property for this object. Donde <i>tipo_pago</i> es tipo de pago para esta venta en caso de ser a contado
	  * @return enum('efectivo','cheque','tarjeta')
	  */
	final public function getTipoPago()
	{
		return $this->tipo_pago;
	}

	/**
	  * setTipoPago( $tipo_pago )
	  * 
	  * Set the <i>tipo_pago</i> property for this object. Donde <i>tipo_pago</i> es tipo de pago para esta venta en caso de ser a contado.
	  * Una validacion basica se hara aqui para comprobar que <i>tipo_pago</i> es de tipo <i>enum('efectivo','cheque','tarjeta')</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param enum('efectivo','cheque','tarjeta')
	  */
	final public function setTipoPago( $tipo_pago )
	{
		$this->tipo_pago = $tipo_pago;
	}

	/**
	  * getFecha
	  * 
	  * Get the <i>fecha</i> property for this object. Donde <i>fecha</i> es fecha de venta
	  * @return timestamp
	  */
	final public function getFecha()
	{
		return $this->fecha;
	}

	/**
	  * setFecha( $fecha )
	  * 
	  * Set the <i>fecha</i> property for this object. Donde <i>fecha</i> es fecha de venta.
	  * Una validacion basica se hara aqui para comprobar que <i>fecha</i> es de tipo <i>timestamp</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param timestamp
	  */
	final public function setFecha( $fecha )
	{
		$this->fecha = $fecha;
	}

	/**
	  * getSubtotal
	  * 
	  * Get the <i>subtotal</i> property for this object. Donde <i>subtotal</i> es subtotal de la venta, puede ser nulo
	  * @return float
	  */
	final public function getSubtotal()
	{
		return $this->subtotal;
	}

	/**
	  * setSubtotal( $subtotal )
	  * 
	  * Set the <i>subtotal</i> property for this object. Donde <i>subtotal</i> es subtotal de la venta, puede ser nulo.
	  * Una validacion basica se hara aqui para comprobar que <i>subtotal</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setSubtotal( $subtotal )
	{
		$this->subtotal = $subtotal;
	}

	/**
	  * getIva
	  * 
	  * Get the <i>iva</i> property for this object. Donde <i>iva</i> es iva agregado por la venta, depende de cada sucursal
	  * @return float
	  */
	final public function getIva()
	{
		return $this->iva;
	}

	/**
	  * setIva( $iva )
	  * 
	  * Set the <i>iva</i> property for this object. Donde <i>iva</i> es iva agregado por la venta, depende de cada sucursal.
	  * Una validacion basica se hara aqui para comprobar que <i>iva</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setIva( $iva )
	{
		$this->iva = $iva;
	}

	/**
	  * getDescuento
	  * 
	  * Get the <i>descuento</i> property for this object. Donde <i>descuento</i> es descuento aplicado a esta venta
	  * @return float
	  */
	final public function getDescuento()
	{
		return $this->descuento;
	}

	/**
	  * setDescuento( $descuento )
	  * 
	  * Set the <i>descuento</i> property for this object. Donde <i>descuento</i> es descuento aplicado a esta venta.
	  * Una validacion basica se hara aqui para comprobar que <i>descuento</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setDescuento( $descuento )
	{
		$this->descuento = $descuento;
	}

	/**
	  * getTotal
	  * 
	  * Get the <i>total</i> property for this object. Donde <i>total</i> es total de esta venta
	  * @return float
	  */
	final public function getTotal()
	{
		return $this->total;
	}

	/**
	  * setTotal( $total )
	  * 
	  * Set the <i>total</i> property for this object. Donde <i>total</i> es total de esta venta.
	  * Una validacion basica se hara aqui para comprobar que <i>total</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setTotal( $total )
	{
		$this->total = $total;
	}

	/**
	  * getIdSucursal
	  * 
	  * Get the <i>id_sucursal</i> property for this object. Donde <i>id_sucursal</i> es sucursal de la venta
	  * @return int(11)
	  */
	final public function getIdSucursal()
	{
		return $this->id_sucursal;
	}

	/**
	  * setIdSucursal( $id_sucursal )
	  * 
	  * Set the <i>id_sucursal</i> property for this object. Donde <i>id_sucursal</i> es sucursal de la venta.
	  * Una validacion basica se hara aqui para comprobar que <i>id_sucursal</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdSucursal( $id_sucursal )
	{
		$this->id_sucursal = $id_sucursal;
	}

	/**
	  * getIdUsuario
	  * 
	  * Get the <i>id_usuario</i> property for this object. Donde <i>id_usuario</i> es empleado que lo vendio
	  * @return int(11)
	  */
	final public function getIdUsuario()
	{
		return $this->id_usuario;
	}

	/**
	  * setIdUsuario( $id_usuario )
	  * 
	  * Set the <i>id_usuario</i> property for this object. Donde <i>id_usuario</i> es empleado que lo vendio.
	  * Una validacion basica se hara aqui para comprobar que <i>id_usuario</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdUsuario( $id_usuario )
	{
		$this->id_usuario = $id_usuario;
	}

	/**
	  * getPagado
	  * 
	  * Get the <i>pagado</i> property for this object. Donde <i>pagado</i> es porcentaje pagado de esta venta
	  * @return float
	  */
	final public function getPagado()
	{
		return $this->pagado;
	}

	/**
	  * setPagado( $pagado )
	  * 
	  * Set the <i>pagado</i> property for this object. Donde <i>pagado</i> es porcentaje pagado de esta venta.
	  * Una validacion basica se hara aqui para comprobar que <i>pagado</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setPagado( $pagado )
	{
		$this->pagado = $pagado;
	}

	/**
	  * getCancelada
	  * 
	  * Get the <i>cancelada</i> property for this object. Donde <i>cancelada</i> es verdadero si esta venta ha sido cancelada, falso si no
	  * @return tinyint(1)
	  */
	final public function getCancelada()
	{
		return $this->cancelada;
	}

	/**
	  * setCancelada( $cancelada )
	  * 
	  * Set the <i>cancelada</i> property for this object. Donde <i>cancelada</i> es verdadero si esta venta ha sido cancelada, falso si no.
	  * Una validacion basica se hara aqui para comprobar que <i>cancelada</i> es de tipo <i>tinyint(1)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param tinyint(1)
	  */
	final public function setCancelada( $cancelada )
	{
		$this->cancelada = $cancelada;
	}

	/**
	  * getIp
	  * 
	  * Get the <i>ip</i> property for this object. Donde <i>ip</i> es ip de donde provino esta compra
	  * @return varchar(16)
	  */
	final public function getIp()
	{
		return $this->ip;
	}

	/**
	  * setIp( $ip )
	  * 
	  * Set the <i>ip</i> property for this object. Donde <i>ip</i> es ip de donde provino esta compra.
	  * Una validacion basica se hara aqui para comprobar que <i>ip</i> es de tipo <i>varchar(16)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(16)
	  */
	final public function setIp( $ip )
	{
		$this->ip = $ip;
	}

	/**
	  * getLiquidada
	  * 
	  * Get the <i>liquidada</i> property for this object. Donde <i>liquidada</i> es Verdadero si esta venta ha sido liquidada, falso si hay un saldo pendiente
	  * @return tinyint(1)
	  */
	final public function getLiquidada()
	{
		return $this->liquidada;
	}

	/**
	  * setLiquidada( $liquidada )
	  * 
	  * Set the <i>liquidada</i> property for this object. Donde <i>liquidada</i> es Verdadero si esta venta ha sido liquidada, falso si hay un saldo pendiente.
	  * Una validacion basica se hara aqui para comprobar que <i>liquidada</i> es de tipo <i>tinyint(1)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param tinyint(1)
	  */
	final public function setLiquidada( $liquidada )
	{
		$this->liquidada = $liquidada;
	}

}