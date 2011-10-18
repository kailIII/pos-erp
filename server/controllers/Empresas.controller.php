<?php
require_once("interfaces/Empresas.interface.php");
/**
  *
  *
  *
  **/
	
  class EmpresasController implements IEmpresas{
  
        var $formato_fecha="Y-m-d H:i:s";
	/**
 	 *
 	 *Mostrar?odas la empresas en el sistema, as?omo sus sucursalse y sus gerentes[a] correspondientes. Por default no se mostraran las empresas ni sucursales inactivas. 
 	 *
 	 * @param activa bool Si no se obtiene este valor, se listaran tanto empresas activas como inactivas, si su valor es true, se mostraran solo las empresas activas, si es false, se mostraran solo las inactivas
 	 * @return empresas json Arreglo de objetos que contendr� las empresas de la instancia
 	 **/
	public function Lista
	(
		$activa = null
	)
	{  
  		if($activa === null)
  			return EmpresaDAO::getAll();

  		$e = new Empresa();
  		$e->setActivo( $activa );
  		return EmpresaDAO::search( $e );


  	}
  
	/**
 	 *
 	 *Relacionar una sucursal a esta empresa. Cuando se llama a este metodo, se crea un almacen de esta sucursal para esta empresa
 	 *
 	 * @param id_empresa int 
 	 * @param sucursales json Arreglo de objetos que tendran los ids de sucursales, un campo opcional de  margen de utilidad que simboliza el margen de utilidad que esas sucursales ganaran para los productos de esa empresa y un campo de descuento, que indica el descuento que se aplicara a todas los productos de esa empresa en esa sucursal
 	 **/
	public function Agregar_sucursales
	(
		$id_empresa, 
		$sucursales
	)
	{
            Logger::log("Agregando sucursales a la empresa");
            if(EmpresaDAO::getByPK($id_empresa)==null)
            {
                Logger::error("La empresa con id: ".$id_empresa." no existe");
                throw new Exception("La empresa con id: ".$id_empresa." no existe");
            }
            $sucursal_empresa=new SucursalEmpresa();
            $sucursal_empresa->setIdEmpresa($id_empresa);
            DAO::transBegin();
            try
            {
                foreach($sucursales as $sucursal)
                {
                    if(SucursalDAO::getByPK($sucursal["id_sucursal"])==null)
                    {
                        Logger::error("La sucursal con id: ".$sucursal["id_sucursal"]." no existe");
                        throw new Exception("La sucursal con id: ".$sucursal["id_sucursal"]." no existe");
                    }
                    $sucursal_empresa->setIdSucursal($sucursal["id_sucursal"]);
                    $sucursal_empresa->setDescuento($sucursal["descuento"]);
                    $sucursal_empresa->setMargenUtilidad($sucursal["margen_utilidad"]);
                    SucursalEmpresaDAO::save($sucursal_empresa);
                }
            }
            catch(Exception $e)
            {
                DAO::transRollback();
                Logger::error("No se pudieron agregar las sucursales a la empresa: ".$e);
                throw $e;
            }
            DAO::transEnd();
            Logger::log("Sucursales agregadas exitosamente");
	}
  
	/**
 	 *
 	 *Crear una nueva empresa. Por default una nueva empresa no tiene sucursales.
 	 *
 	 * @param colonia string Colonia de la empresa
 	 * @param telefono1 string telefono de la empresa
 	 * @param codigo_postal string Codigo postal de la empresa
 	 * @param curp string CURP de la nueva empresa.
 	 * @param razon_social string El nombre de la nueva empresa.
 	 * @param numero_exterior string Numero externo de la emresa
 	 * @param ciudad	 int Identificacor de la ciudad
 	 * @param rfc string RFC de la nueva empresa.
 	 * @param calle string Calle de la empresa
 	 * @param numero_interior string Numero interno de la empresa
 	 * @param telefono2 string Telefono 2 de la empresa
 	 * @param e-mail string Correo electronico de la empresa
 	 * @param texto_extra string Comentarios sobre la ubicacin de la empresa.
 	 * @param direccion_web string Direccin web de la empresa
 	 * @param retenciones json Objeto que contendra los ids de las retenciones que aplican a esta empresa
 	 * @param margen_utilidad float Porcentaje del margen de utilidad que le gana esta empresa a todos los productos que ofrece
 	 * @param descuento float Descuento que se aplciara a todos los productos de esta empresa
 	 * @param representante_legal string El nombre del representante legal de la nueva empresa.
 	 * @param impuestos json Objeto que contendra los ids de los impuestos que aplican a esta empresa 
 	 * @return id_empresa int El ID autogenerado de la nueva empresa.
 	 **/
	public function Nuevo
	(
		$colonia, 
		$codigo_postal, 
		$curp, 
		$razon_social, 
		$numero_exterior, 
		$ciudad	, 
		$rfc, 
		$calle,
                $telefono1 = null,
		$numero_interior = null, 
		$telefono2 = null, 
		$email = null, 
		$texto_extra = null, 
		$direccion_web = null, 
		$retenciones = null, 
		$margen_utilidad = null, 
		$descuento = null, 
		$representante_legal = null, 
		$impuestos = null
	)
	{  
            Logger::log("Creando empresa");
//            $addr = new Direccion(array(
//                        "calle"             =>  $calle,
//                        "numero_exterior"   =>  $numero_exterior,
//                        "colonia"           =>  $colonia,
//                        "id_ciudad"         =>  $ciudad,
//                        "codigo_postal"     =>  $codigo_postal,
//                        "numero_interior"   =>  $numero_interior,
//                        "referencia"        =>  $texto_extra,
//                        "telefono"          =>  $telefono1,
//                        "telefono2"         =>  $telefono2
//                    ));

            $e = new Empresa(array(
                            "activo"                => true,
                            "curp"                  => $curp,
                            "descuento"             => $descuento,
                            "direccion_web"         => $direccion_web,
                            "fecha_alta"            => date($this->formato_fecha,time()),
                            "fecha_baja"            => null,
                            "margen_utilidad"       => $margen_utilidad,
                            "razon_social"          => $razon_social,
                            "representante_legal"   => $representante_legal,
                            "rfc"                   => $rfc
                    ));
             DAO::transBegin();
             try
             {
                 $id_direccion=DireccionController::NuevaDireccion($calle,$numero_exterior,$colonia,$ciudad,$codigo_postal,$numero_interior,$texto_extra,$telefono1,$telefono2);
                 $e->setIdDireccion($id_direccion);
                 EmpresaDAO::save($e);
                 $impuesto_empresa=new ImpuestoEmpresa(array("id_empresa" => $e->getIdEmpresa()));
                 if($impuestos)
                 foreach($impuestos as $id_impuesto)
                 {
                     if(ImpuestoDAO::getByPK($id_impuesto)==null)
                     {
                         Logger::error("El impuesto con id: ".$id_impuesto." no existe");
                         throw new Exception("El impuesto con id: ".$id_impuesto." no existe");
                     }
                     $impuesto_empresa->setIdImpuesto($id_impuesto);
                     ImpuestoEmpresaDAO::save($impuesto_empresa);
                 }
                 $retencion_empresa=new RetencionEmpresa(array("id_empresa" => $e->getIdEmpresa()));
                 if($retenciones)
                 foreach($retenciones as $id_retencion)
                 {
                     if(RetencionDAO::getByPK($id_retencion)==null)
                     {
                         Logger::error("La retencion con id: ".$id_retencion." no existe");
                         throw new Exception("La retencion con id: ".$id_retencion." no existe");
                     }
                     $retencion_empresa->setIdRetencion($id_retencion);
                     RetencionEmpresaDAO::save($retencion_empresa);
                 }
             }
             catch(Exception $e)
             {
                 DAO::transRollback();
                 Logger::error("Error al crear la empresa: ".$e);
                 throw $e;
             }
             DAO::transEnd();
             Logger::log("Empresa creada exitosamente");
             return $e->getIdEmpresa();
	}
  
	/**
 	 *
 	 *Para poder eliminar una empresa es necesario que la empresa no tenga sucursales activas, sus saldos sean 0, que los clientes asociados a dicha empresa no tengan adeudo, ...
 	 *
 	 * @param id_empresa string El id de la empresa a eliminar.
 	 **/
	public function Eliminar
	(
		$id_empresa
	)
	{  
  
  
	}
  
	/**
 	 *
 	 *Un administrador puede editar una sucursal, incuso si hay puntos de venta con sesiones activas que pertenecen a esa empresa. 
 	 *
 	 * @param telefono1 string telefono de la empresa
 	 * @param numero_exterior	 string Numero externo de la emresa
 	 * @param colonia	 string Colonia de la empresa
 	 * @param codigo_postal string Codigo postal de la empresa
 	 * @param curp string CURP de la nueva empresa.
 	 * @param calle	 string Calle de la empresa
 	 * @param id_empresa int Id de la empresa a modificar
 	 * @param rfc string RFC de la nueva empresa.
 	 * @param ciudad int Ciudad donde se encuentra la empresa
 	 * @param razon_social string El nombre de la nueva empresa.
 	 * @param e-mail string Correo electronico de la empresa
 	 * @param representante_legal string El nombre del representante legal de la nueva empresa.
 	 * @param numero_interno string Numero interno de la empresa
 	 * @param direccion_web string Direccin web de la empresa
 	 * @param retenciones json Objeto que contendra los ids de las retenciones que aplican a esta empresa
 	 * @param descuento float Descuento que se aplicara a todos los productos de esta empresa
 	 * @param margen_utilidad float Porcentaje del margen de utilidad que esta empresa le gana a todos sus productos
 	 * @param impuestos json Objeto que contendra los ids de los impuestos que afectan a esta empresa
 	 * @param texto_extra string Comentarios sobre la ubicacin de la empresa.
 	 * @param telefono2 string Telefono 2 de la empresa
 	 **/
	public function Editar
	(
		$id_empresa,
		$descuento = null,
		$margen_utilidad = null,
		$impuestos = null,
		$retenciones = null,
		$direccion_web = null,
		$ciudad = null,
		$razon_social = null,
		$rfc = null,
		$codigo_postal = null,
		$curp = null,
		$calle	 = null,
		$numero_interno = null,
		$representante_legal = null,
		$telefono1 = null,
		$numero_exterior	 = null,
		$colonia	 = null,
		$email = null,
		$telefono2 = null,
		$texto_extra = null
	)
	{  
  
  
	}
  }