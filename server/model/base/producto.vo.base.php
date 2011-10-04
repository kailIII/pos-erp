<?php
/** Value Object file for table producto.
  * 
  * VO does not have any behaviour except for storage and retrieval of its own data (accessors and mutators).
  * @author Andres
  * @access public
  * @package docs
  * 
  */

class Producto extends VO
{
	/**
	  * Constructor de Producto
	  * 
	  * Para construir un objeto de tipo Producto debera llamarse a el constructor 
	  * sin parametros. Es posible, construir un objeto pasando como parametro un arreglo asociativo 
	  * cuyos campos son iguales a las variables que constituyen a este objeto.
	  * @return Producto
	  */
	function __construct( $data = NULL)
	{ 
		if(isset($data))
		{
			if( isset($data['id_producto']) ){
				$this->id_producto = $data['id_producto'];
			}
			if( isset($data['compra_en_mostrador']) ){
				$this->compra_en_mostrador = $data['compra_en_mostrador'];
			}
			if( isset($data['metodo_costeo']) ){
				$this->metodo_costeo = $data['metodo_costeo'];
			}
			if( isset($data['activo']) ){
				$this->activo = $data['activo'];
			}
			if( isset($data['codigo_producto']) ){
				$this->codigo_producto = $data['codigo_producto'];
			}
			if( isset($data['nombre_producto']) ){
				$this->nombre_producto = $data['nombre_producto'];
			}
			if( isset($data['garantia']) ){
				$this->garantia = $data['garantia'];
			}
			if( isset($data['costo_estandar']) ){
				$this->costo_estandar = $data['costo_estandar'];
			}
			if( isset($data['control_de_existencia']) ){
				$this->control_de_existencia = $data['control_de_existencia'];
			}
			if( isset($data['margen_de_utilidad']) ){
				$this->margen_de_utilidad = $data['margen_de_utilidad'];
			}
			if( isset($data['descuento']) ){
				$this->descuento = $data['descuento'];
			}
			if( isset($data['descripcion']) ){
				$this->descripcion = $data['descripcion'];
			}
			if( isset($data['foto_del_producto']) ){
				$this->foto_del_producto = $data['foto_del_producto'];
			}
			if( isset($data['costo_extra_almacen']) ){
				$this->costo_extra_almacen = $data['costo_extra_almacen'];
			}
			if( isset($data['codigo_de_barras']) ){
				$this->codigo_de_barras = $data['codigo_de_barras'];
			}
			if( isset($data['peso_producto']) ){
				$this->peso_producto = $data['peso_producto'];
			}
			if( isset($data['id_unidad_no_convertible']) ){
				$this->id_unidad_no_convertible = $data['id_unidad_no_convertible'];
			}
			if( isset($data['id_unidad_convertible']) ){
				$this->id_unidad_convertible = $data['id_unidad_convertible'];
			}
		}
	}

	/**
	  * Obtener una representacion en String
	  * 
	  * Este metodo permite tratar a un objeto Producto en forma de cadena.
	  * La representacion de este objeto en cadena es la forma JSON (JavaScript Object Notation) para este objeto.
	  * @return String 
	  */
	public function __toString( )
	{ 
		$vec = array( 
			"id_producto" => $this->id_producto,
			"compra_en_mostrador" => $this->compra_en_mostrador,
			"metodo_costeo" => $this->metodo_costeo,
			"activo" => $this->activo,
			"codigo_producto" => $this->codigo_producto,
			"nombre_producto" => $this->nombre_producto,
			"garantia" => $this->garantia,
			"costo_estandar" => $this->costo_estandar,
			"control_de_existencia" => $this->control_de_existencia,
			"margen_de_utilidad" => $this->margen_de_utilidad,
			"descuento" => $this->descuento,
			"descripcion" => $this->descripcion,
			"foto_del_producto" => $this->foto_del_producto,
			"costo_extra_almacen" => $this->costo_extra_almacen,
			"codigo_de_barras" => $this->codigo_de_barras,
			"peso_producto" => $this->peso_producto,
			"id_unidad_no_convertible" => $this->id_unidad_no_convertible,
			"id_unidad_convertible" => $this->id_unidad_convertible
		); 
	return json_encode($vec); 
	}
	
	/**
	  * id_producto
	  * 
	  *  [Campo no documentado]<br>
	  * <b>Llave Primaria</b><br>
	  * <b>Auto Incremento</b><br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_producto;

	/**
	  * compra_en_mostrador
	  * 
	  * Verdadero si el producto se puede comprar en mostrador<br>
	  * @access protected
	  * @var tinyint(1)
	  */
	protected $compra_en_mostrador;

	/**
	  * metodo_costeo
	  * 
	  * Mtodo de costeo del producto: 1 = Costo Promedio en Base a Entradas.2 = Costo Promedio en Base a Entradas Almacn.3 = ltimo costo.4 = UEPS.5 = PEPS.6 = Costo especfico.7 = Costo Estndar<br>
	  * @access protected
	  * @var varchar(50)
	  */
	protected $metodo_costeo;

	/**
	  * activo
	  * 
	  * Si el producto esta activo o no<br>
	  * @access protected
	  * @var tinyint(1)
	  */
	protected $activo;

	/**
	  * codigo_producto
	  * 
	  * Codigo interno del producto<br>
	  * @access protected
	  * @var varchar(30)
	  */
	protected $codigo_producto;

	/**
	  * nombre_producto
	  * 
	  * Nombre del producto<br>
	  * @access protected
	  * @var varchar(30)
	  */
	protected $nombre_producto;

	/**
	  * garantia
	  * 
	  * Si este producto cuenta con un numero de meses de garantia<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $garantia;

	/**
	  * costo_estandar
	  * 
	  * Costo estandar del producto<br>
	  * @access protected
	  * @var float
	  */
	protected $costo_estandar;

	/**
	  * control_de_existencia
	  * 
	  * 00000001 = Unidades. 00000010 = Caractersticas. 00000100 = Series. 00001000 = Pedimentos. 00010000 = Lote<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $control_de_existencia;

	/**
	  * margen_de_utilidad
	  * 
	  * Un porcentage de 0 a 100 si queremos que este producto marque utilidad en especifico<br>
	  * @access protected
	  * @var float
	  */
	protected $margen_de_utilidad;

	/**
	  * descuento
	  * 
	  * Descuento que tendra este producto<br>
	  * @access protected
	  * @var float
	  */
	protected $descuento;

	/**
	  * descripcion
	  * 
	  * Descripcion del producto<br>
	  * @access protected
	  * @var varchar(255)
	  */
	protected $descripcion;

	/**
	  * foto_del_producto
	  * 
	  * Url a una foto de este producto<br>
	  * @access protected
	  * @var varchar(100)
	  */
	protected $foto_del_producto;

	/**
	  * costo_extra_almacen
	  * 
	  * Si este producto produce un costo extra en el almacen<br>
	  * @access protected
	  * @var float
	  */
	protected $costo_extra_almacen;

	/**
	  * codigo_de_barras
	  * 
	  * El codigo de barras de este producto<br>
	  * @access protected
	  * @var varchar(30)
	  */
	protected $codigo_de_barras;

	/**
	  * peso_producto
	  * 
	  * El peso de este producto en Kg<br>
	  * @access protected
	  * @var float
	  */
	protected $peso_producto;

	/**
	  * id_unidad_no_convertible
	  * 
	  * Id de la unidad no convertible del producto<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_unidad_no_convertible;

	/**
	  * id_unidad_convertible
	  * 
	  * Id de la unidad convertible del producto<br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_unidad_convertible;

	/**
	  * getIdProducto
	  * 
	  * Get the <i>id_producto</i> property for this object. Donde <i>id_producto</i> es  [Campo no documentado]
	  * @return int(11)
	  */
	final public function getIdProducto()
	{
		return $this->id_producto;
	}

	/**
	  * setIdProducto( $id_producto )
	  * 
	  * Set the <i>id_producto</i> property for this object. Donde <i>id_producto</i> es  [Campo no documentado].
	  * Una validacion basica se hara aqui para comprobar que <i>id_producto</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * <br><br>Esta propiedad se mapea con un campo que es de <b>Auto Incremento</b> !<br>
	  * No deberias usar setIdProducto( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * <br><br>Esta propiedad se mapea con un campo que es una <b>Llave Primaria</b> !<br>
	  * No deberias usar setIdProducto( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * @param int(11)
	  */
	final public function setIdProducto( $id_producto )
	{
		$this->id_producto = $id_producto;
	}

	/**
	  * getCompraEnMostrador
	  * 
	  * Get the <i>compra_en_mostrador</i> property for this object. Donde <i>compra_en_mostrador</i> es Verdadero si el producto se puede comprar en mostrador
	  * @return tinyint(1)
	  */
	final public function getCompraEnMostrador()
	{
		return $this->compra_en_mostrador;
	}

	/**
	  * setCompraEnMostrador( $compra_en_mostrador )
	  * 
	  * Set the <i>compra_en_mostrador</i> property for this object. Donde <i>compra_en_mostrador</i> es Verdadero si el producto se puede comprar en mostrador.
	  * Una validacion basica se hara aqui para comprobar que <i>compra_en_mostrador</i> es de tipo <i>tinyint(1)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param tinyint(1)
	  */
	final public function setCompraEnMostrador( $compra_en_mostrador )
	{
		$this->compra_en_mostrador = $compra_en_mostrador;
	}

	/**
	  * getMetodoCosteo
	  * 
	  * Get the <i>metodo_costeo</i> property for this object. Donde <i>metodo_costeo</i> es Mtodo de costeo del producto: 1 = Costo Promedio en Base a Entradas.2 = Costo Promedio en Base a Entradas Almacn.3 = ltimo costo.4 = UEPS.5 = PEPS.6 = Costo especfico.7 = Costo Estndar
	  * @return varchar(50)
	  */
	final public function getMetodoCosteo()
	{
		return $this->metodo_costeo;
	}

	/**
	  * setMetodoCosteo( $metodo_costeo )
	  * 
	  * Set the <i>metodo_costeo</i> property for this object. Donde <i>metodo_costeo</i> es Mtodo de costeo del producto: 1 = Costo Promedio en Base a Entradas.2 = Costo Promedio en Base a Entradas Almacn.3 = ltimo costo.4 = UEPS.5 = PEPS.6 = Costo especfico.7 = Costo Estndar.
	  * Una validacion basica se hara aqui para comprobar que <i>metodo_costeo</i> es de tipo <i>varchar(50)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(50)
	  */
	final public function setMetodoCosteo( $metodo_costeo )
	{
		$this->metodo_costeo = $metodo_costeo;
	}

	/**
	  * getActivo
	  * 
	  * Get the <i>activo</i> property for this object. Donde <i>activo</i> es Si el producto esta activo o no
	  * @return tinyint(1)
	  */
	final public function getActivo()
	{
		return $this->activo;
	}

	/**
	  * setActivo( $activo )
	  * 
	  * Set the <i>activo</i> property for this object. Donde <i>activo</i> es Si el producto esta activo o no.
	  * Una validacion basica se hara aqui para comprobar que <i>activo</i> es de tipo <i>tinyint(1)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param tinyint(1)
	  */
	final public function setActivo( $activo )
	{
		$this->activo = $activo;
	}

	/**
	  * getCodigoProducto
	  * 
	  * Get the <i>codigo_producto</i> property for this object. Donde <i>codigo_producto</i> es Codigo interno del producto
	  * @return varchar(30)
	  */
	final public function getCodigoProducto()
	{
		return $this->codigo_producto;
	}

	/**
	  * setCodigoProducto( $codigo_producto )
	  * 
	  * Set the <i>codigo_producto</i> property for this object. Donde <i>codigo_producto</i> es Codigo interno del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>codigo_producto</i> es de tipo <i>varchar(30)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(30)
	  */
	final public function setCodigoProducto( $codigo_producto )
	{
		$this->codigo_producto = $codigo_producto;
	}

	/**
	  * getNombreProducto
	  * 
	  * Get the <i>nombre_producto</i> property for this object. Donde <i>nombre_producto</i> es Nombre del producto
	  * @return varchar(30)
	  */
	final public function getNombreProducto()
	{
		return $this->nombre_producto;
	}

	/**
	  * setNombreProducto( $nombre_producto )
	  * 
	  * Set the <i>nombre_producto</i> property for this object. Donde <i>nombre_producto</i> es Nombre del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>nombre_producto</i> es de tipo <i>varchar(30)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(30)
	  */
	final public function setNombreProducto( $nombre_producto )
	{
		$this->nombre_producto = $nombre_producto;
	}

	/**
	  * getGarantia
	  * 
	  * Get the <i>garantia</i> property for this object. Donde <i>garantia</i> es Si este producto cuenta con un numero de meses de garantia
	  * @return int(11)
	  */
	final public function getGarantia()
	{
		return $this->garantia;
	}

	/**
	  * setGarantia( $garantia )
	  * 
	  * Set the <i>garantia</i> property for this object. Donde <i>garantia</i> es Si este producto cuenta con un numero de meses de garantia.
	  * Una validacion basica se hara aqui para comprobar que <i>garantia</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setGarantia( $garantia )
	{
		$this->garantia = $garantia;
	}

	/**
	  * getCostoEstandar
	  * 
	  * Get the <i>costo_estandar</i> property for this object. Donde <i>costo_estandar</i> es Costo estandar del producto
	  * @return float
	  */
	final public function getCostoEstandar()
	{
		return $this->costo_estandar;
	}

	/**
	  * setCostoEstandar( $costo_estandar )
	  * 
	  * Set the <i>costo_estandar</i> property for this object. Donde <i>costo_estandar</i> es Costo estandar del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>costo_estandar</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setCostoEstandar( $costo_estandar )
	{
		$this->costo_estandar = $costo_estandar;
	}

	/**
	  * getControlDeExistencia
	  * 
	  * Get the <i>control_de_existencia</i> property for this object. Donde <i>control_de_existencia</i> es 00000001 = Unidades. 00000010 = Caractersticas. 00000100 = Series. 00001000 = Pedimentos. 00010000 = Lote
	  * @return int(11)
	  */
	final public function getControlDeExistencia()
	{
		return $this->control_de_existencia;
	}

	/**
	  * setControlDeExistencia( $control_de_existencia )
	  * 
	  * Set the <i>control_de_existencia</i> property for this object. Donde <i>control_de_existencia</i> es 00000001 = Unidades. 00000010 = Caractersticas. 00000100 = Series. 00001000 = Pedimentos. 00010000 = Lote.
	  * Una validacion basica se hara aqui para comprobar que <i>control_de_existencia</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setControlDeExistencia( $control_de_existencia )
	{
		$this->control_de_existencia = $control_de_existencia;
	}

	/**
	  * getMargenDeUtilidad
	  * 
	  * Get the <i>margen_de_utilidad</i> property for this object. Donde <i>margen_de_utilidad</i> es Un porcentage de 0 a 100 si queremos que este producto marque utilidad en especifico
	  * @return float
	  */
	final public function getMargenDeUtilidad()
	{
		return $this->margen_de_utilidad;
	}

	/**
	  * setMargenDeUtilidad( $margen_de_utilidad )
	  * 
	  * Set the <i>margen_de_utilidad</i> property for this object. Donde <i>margen_de_utilidad</i> es Un porcentage de 0 a 100 si queremos que este producto marque utilidad en especifico.
	  * Una validacion basica se hara aqui para comprobar que <i>margen_de_utilidad</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setMargenDeUtilidad( $margen_de_utilidad )
	{
		$this->margen_de_utilidad = $margen_de_utilidad;
	}

	/**
	  * getDescuento
	  * 
	  * Get the <i>descuento</i> property for this object. Donde <i>descuento</i> es Descuento que tendra este producto
	  * @return float
	  */
	final public function getDescuento()
	{
		return $this->descuento;
	}

	/**
	  * setDescuento( $descuento )
	  * 
	  * Set the <i>descuento</i> property for this object. Donde <i>descuento</i> es Descuento que tendra este producto.
	  * Una validacion basica se hara aqui para comprobar que <i>descuento</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setDescuento( $descuento )
	{
		$this->descuento = $descuento;
	}

	/**
	  * getDescripcion
	  * 
	  * Get the <i>descripcion</i> property for this object. Donde <i>descripcion</i> es Descripcion del producto
	  * @return varchar(255)
	  */
	final public function getDescripcion()
	{
		return $this->descripcion;
	}

	/**
	  * setDescripcion( $descripcion )
	  * 
	  * Set the <i>descripcion</i> property for this object. Donde <i>descripcion</i> es Descripcion del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>descripcion</i> es de tipo <i>varchar(255)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(255)
	  */
	final public function setDescripcion( $descripcion )
	{
		$this->descripcion = $descripcion;
	}

	/**
	  * getFotoDelProducto
	  * 
	  * Get the <i>foto_del_producto</i> property for this object. Donde <i>foto_del_producto</i> es Url a una foto de este producto
	  * @return varchar(100)
	  */
	final public function getFotoDelProducto()
	{
		return $this->foto_del_producto;
	}

	/**
	  * setFotoDelProducto( $foto_del_producto )
	  * 
	  * Set the <i>foto_del_producto</i> property for this object. Donde <i>foto_del_producto</i> es Url a una foto de este producto.
	  * Una validacion basica se hara aqui para comprobar que <i>foto_del_producto</i> es de tipo <i>varchar(100)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(100)
	  */
	final public function setFotoDelProducto( $foto_del_producto )
	{
		$this->foto_del_producto = $foto_del_producto;
	}

	/**
	  * getCostoExtraAlmacen
	  * 
	  * Get the <i>costo_extra_almacen</i> property for this object. Donde <i>costo_extra_almacen</i> es Si este producto produce un costo extra en el almacen
	  * @return float
	  */
	final public function getCostoExtraAlmacen()
	{
		return $this->costo_extra_almacen;
	}

	/**
	  * setCostoExtraAlmacen( $costo_extra_almacen )
	  * 
	  * Set the <i>costo_extra_almacen</i> property for this object. Donde <i>costo_extra_almacen</i> es Si este producto produce un costo extra en el almacen.
	  * Una validacion basica se hara aqui para comprobar que <i>costo_extra_almacen</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setCostoExtraAlmacen( $costo_extra_almacen )
	{
		$this->costo_extra_almacen = $costo_extra_almacen;
	}

	/**
	  * getCodigoDeBarras
	  * 
	  * Get the <i>codigo_de_barras</i> property for this object. Donde <i>codigo_de_barras</i> es El codigo de barras de este producto
	  * @return varchar(30)
	  */
	final public function getCodigoDeBarras()
	{
		return $this->codigo_de_barras;
	}

	/**
	  * setCodigoDeBarras( $codigo_de_barras )
	  * 
	  * Set the <i>codigo_de_barras</i> property for this object. Donde <i>codigo_de_barras</i> es El codigo de barras de este producto.
	  * Una validacion basica se hara aqui para comprobar que <i>codigo_de_barras</i> es de tipo <i>varchar(30)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(30)
	  */
	final public function setCodigoDeBarras( $codigo_de_barras )
	{
		$this->codigo_de_barras = $codigo_de_barras;
	}

	/**
	  * getPesoProducto
	  * 
	  * Get the <i>peso_producto</i> property for this object. Donde <i>peso_producto</i> es El peso de este producto en Kg
	  * @return float
	  */
	final public function getPesoProducto()
	{
		return $this->peso_producto;
	}

	/**
	  * setPesoProducto( $peso_producto )
	  * 
	  * Set the <i>peso_producto</i> property for this object. Donde <i>peso_producto</i> es El peso de este producto en Kg.
	  * Una validacion basica se hara aqui para comprobar que <i>peso_producto</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setPesoProducto( $peso_producto )
	{
		$this->peso_producto = $peso_producto;
	}

	/**
	  * getIdUnidadNoConvertible
	  * 
	  * Get the <i>id_unidad_no_convertible</i> property for this object. Donde <i>id_unidad_no_convertible</i> es Id de la unidad no convertible del producto
	  * @return int(11)
	  */
	final public function getIdUnidadNoConvertible()
	{
		return $this->id_unidad_no_convertible;
	}

	/**
	  * setIdUnidadNoConvertible( $id_unidad_no_convertible )
	  * 
	  * Set the <i>id_unidad_no_convertible</i> property for this object. Donde <i>id_unidad_no_convertible</i> es Id de la unidad no convertible del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>id_unidad_no_convertible</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdUnidadNoConvertible( $id_unidad_no_convertible )
	{
		$this->id_unidad_no_convertible = $id_unidad_no_convertible;
	}

	/**
	  * getIdUnidadConvertible
	  * 
	  * Get the <i>id_unidad_convertible</i> property for this object. Donde <i>id_unidad_convertible</i> es Id de la unidad convertible del producto
	  * @return int(11)
	  */
	final public function getIdUnidadConvertible()
	{
		return $this->id_unidad_convertible;
	}

	/**
	  * setIdUnidadConvertible( $id_unidad_convertible )
	  * 
	  * Set the <i>id_unidad_convertible</i> property for this object. Donde <i>id_unidad_convertible</i> es Id de la unidad convertible del producto.
	  * Una validacion basica se hara aqui para comprobar que <i>id_unidad_convertible</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param int(11)
	  */
	final public function setIdUnidadConvertible( $id_unidad_convertible )
	{
		$this->id_unidad_convertible = $id_unidad_convertible;
	}

}
