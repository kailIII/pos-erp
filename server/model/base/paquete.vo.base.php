<?php
/** Value Object file for table paquete.
  * 
  * VO does not have any behaviour except for storage and retrieval of its own data (accessors and mutators).
  * @author Andres
  * @access public
  * @package docs
  * 
  */

class Paquete extends VO
{
	/**
	  * Constructor de Paquete
	  * 
	  * Para construir un objeto de tipo Paquete debera llamarse a el constructor 
	  * sin parametros. Es posible, construir un objeto pasando como parametro un arreglo asociativo 
	  * cuyos campos son iguales a las variables que constituyen a este objeto.
	  * @return Paquete
	  */
	function __construct( $data = NULL)
	{ 
		if(isset($data))
		{
			if( isset($data['id_paquete']) ){
				$this->id_paquete = $data['id_paquete'];
			}
			if( isset($data['nombre']) ){
				$this->nombre = $data['nombre'];
			}
			if( isset($data['descripcion']) ){
				$this->descripcion = $data['descripcion'];
			}
			if( isset($data['margen_utilidad']) ){
				$this->margen_utilidad = $data['margen_utilidad'];
			}
			if( isset($data['descuento']) ){
				$this->descuento = $data['descuento'];
			}
			if( isset($data['foto_paquete']) ){
				$this->foto_paquete = $data['foto_paquete'];
			}
			if( isset($data['activo']) ){
				$this->activo = $data['activo'];
			}
		}
	}

	/**
	  * Obtener una representacion en String
	  * 
	  * Este metodo permite tratar a un objeto Paquete en forma de cadena.
	  * La representacion de este objeto en cadena es la forma JSON (JavaScript Object Notation) para este objeto.
	  * @return String 
	  */
	public function __toString( )
	{ 
		$vec = array( 
			"id_paquete" => $this->id_paquete,
			"nombre" => $this->nombre,
			"descripcion" => $this->descripcion,
			"margen_utilidad" => $this->margen_utilidad,
			"descuento" => $this->descuento,
			"foto_paquete" => $this->foto_paquete,
			"activo" => $this->activo
		); 
	return json_encode($vec); 
	}
	
	/**
	  * id_paquete
	  * 
	  * Id de la tabla paquete<br>
	  * <b>Llave Primaria</b><br>
	  * <b>Auto Incremento</b><br>
	  * @access protected
	  * @var int(11)
	  */
	protected $id_paquete;

	/**
	  * nombre
	  * 
	  * Nombre del paquete<br>
	  * @access protected
	  * @var varchar(100)
	  */
	protected $nombre;

	/**
	  * descripcion
	  * 
	  * Descripcion larga del paquete<br>
	  * @access protected
	  * @var varchar(255)
	  */
	protected $descripcion;

	/**
	  * margen_utilidad
	  * 
	  * Margen de utilidad que se obtendra al vender este paquete<br>
	  * @access protected
	  * @var float
	  */
	protected $margen_utilidad;

	/**
	  * descuento
	  * 
	  * Descuento que se aplciara a este paquete<br>
	  * @access protected
	  * @var float
	  */
	protected $descuento;

	/**
	  * foto_paquete
	  * 
	  * Url de la foto del paquete<br>
	  * @access protected
	  * @var varchar(255)
	  */
	protected $foto_paquete;

	/**
	  * activo
	  * 
	  * Si el paquete esta activo o no<br>
	  * @access protected
	  * @var tinyint(1)
	  */
	protected $activo;

	/**
	  * getIdPaquete
	  * 
	  * Get the <i>id_paquete</i> property for this object. Donde <i>id_paquete</i> es Id de la tabla paquete
	  * @return int(11)
	  */
	final public function getIdPaquete()
	{
		return $this->id_paquete;
	}

	/**
	  * setIdPaquete( $id_paquete )
	  * 
	  * Set the <i>id_paquete</i> property for this object. Donde <i>id_paquete</i> es Id de la tabla paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>id_paquete</i> es de tipo <i>int(11)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * <br><br>Esta propiedad se mapea con un campo que es de <b>Auto Incremento</b> !<br>
	  * No deberias usar setIdPaquete( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * <br><br>Esta propiedad se mapea con un campo que es una <b>Llave Primaria</b> !<br>
	  * No deberias usar setIdPaquete( ) a menos que sepas exactamente lo que estas haciendo.<br>
	  * @param int(11)
	  */
	final public function setIdPaquete( $id_paquete )
	{
		$this->id_paquete = $id_paquete;
	}

	/**
	  * getNombre
	  * 
	  * Get the <i>nombre</i> property for this object. Donde <i>nombre</i> es Nombre del paquete
	  * @return varchar(100)
	  */
	final public function getNombre()
	{
		return $this->nombre;
	}

	/**
	  * setNombre( $nombre )
	  * 
	  * Set the <i>nombre</i> property for this object. Donde <i>nombre</i> es Nombre del paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>nombre</i> es de tipo <i>varchar(100)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(100)
	  */
	final public function setNombre( $nombre )
	{
		$this->nombre = $nombre;
	}

	/**
	  * getDescripcion
	  * 
	  * Get the <i>descripcion</i> property for this object. Donde <i>descripcion</i> es Descripcion larga del paquete
	  * @return varchar(255)
	  */
	final public function getDescripcion()
	{
		return $this->descripcion;
	}

	/**
	  * setDescripcion( $descripcion )
	  * 
	  * Set the <i>descripcion</i> property for this object. Donde <i>descripcion</i> es Descripcion larga del paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>descripcion</i> es de tipo <i>varchar(255)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(255)
	  */
	final public function setDescripcion( $descripcion )
	{
		$this->descripcion = $descripcion;
	}

	/**
	  * getMargenUtilidad
	  * 
	  * Get the <i>margen_utilidad</i> property for this object. Donde <i>margen_utilidad</i> es Margen de utilidad que se obtendra al vender este paquete
	  * @return float
	  */
	final public function getMargenUtilidad()
	{
		return $this->margen_utilidad;
	}

	/**
	  * setMargenUtilidad( $margen_utilidad )
	  * 
	  * Set the <i>margen_utilidad</i> property for this object. Donde <i>margen_utilidad</i> es Margen de utilidad que se obtendra al vender este paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>margen_utilidad</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setMargenUtilidad( $margen_utilidad )
	{
		$this->margen_utilidad = $margen_utilidad;
	}

	/**
	  * getDescuento
	  * 
	  * Get the <i>descuento</i> property for this object. Donde <i>descuento</i> es Descuento que se aplciara a este paquete
	  * @return float
	  */
	final public function getDescuento()
	{
		return $this->descuento;
	}

	/**
	  * setDescuento( $descuento )
	  * 
	  * Set the <i>descuento</i> property for this object. Donde <i>descuento</i> es Descuento que se aplciara a este paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>descuento</i> es de tipo <i>float</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param float
	  */
	final public function setDescuento( $descuento )
	{
		$this->descuento = $descuento;
	}

	/**
	  * getFotoPaquete
	  * 
	  * Get the <i>foto_paquete</i> property for this object. Donde <i>foto_paquete</i> es Url de la foto del paquete
	  * @return varchar(255)
	  */
	final public function getFotoPaquete()
	{
		return $this->foto_paquete;
	}

	/**
	  * setFotoPaquete( $foto_paquete )
	  * 
	  * Set the <i>foto_paquete</i> property for this object. Donde <i>foto_paquete</i> es Url de la foto del paquete.
	  * Una validacion basica se hara aqui para comprobar que <i>foto_paquete</i> es de tipo <i>varchar(255)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param varchar(255)
	  */
	final public function setFotoPaquete( $foto_paquete )
	{
		$this->foto_paquete = $foto_paquete;
	}

	/**
	  * getActivo
	  * 
	  * Get the <i>activo</i> property for this object. Donde <i>activo</i> es Si el paquete esta activo o no
	  * @return tinyint(1)
	  */
	final public function getActivo()
	{
		return $this->activo;
	}

	/**
	  * setActivo( $activo )
	  * 
	  * Set the <i>activo</i> property for this object. Donde <i>activo</i> es Si el paquete esta activo o no.
	  * Una validacion basica se hara aqui para comprobar que <i>activo</i> es de tipo <i>tinyint(1)</i>. 
	  * Si esta validacion falla, se arrojara... algo. 
	  * @param tinyint(1)
	  */
	final public function setActivo( $activo )
	{
		$this->activo = $activo;
	}

}
