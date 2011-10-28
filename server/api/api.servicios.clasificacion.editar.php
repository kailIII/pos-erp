<?php
/**
  * GET api/servicios/clasificacion/editar
  * Edita una clasificacion de servicio
  *
  * Edita la informaci?n de una clasificaci?n de servicio
  *
  *
  *
  **/

  class ApiServiciosClasificacionEditar extends ApiHandler {
  

	protected function DeclareAllowedRoles(){  return BYPASS;  }
	protected function CheckAuthorization() {}
	protected function GetRequest()
	{
		$this->request = array(	
			"id_clasificacion_servicio" => new ApiExposedProperty("id_clasificacion_servicio", true, GET, array( "int" )),
			"retenciones" => new ApiExposedProperty("retenciones", false, GET, array( "json" )),
			"impuestos" => new ApiExposedProperty("impuestos", false, GET, array( "json" )),
			"descuento" => new ApiExposedProperty("descuento", false, GET, array( "float" )),
			"margen_utilidad" => new ApiExposedProperty("margen_utilidad", false, GET, array( "float" )),
			"descripcion" => new ApiExposedProperty("descripcion", false, GET, array( "string" )),
			"garantia" => new ApiExposedProperty("garantia", false, GET, array( "int" )),
			"nombre" => new ApiExposedProperty("nombre", false, GET, array( "string" )),
		);
	}

	protected function GenerateResponse() {		
		try{
 		$this->response = ServiciosController::EditarClasificacion( 
 			
			
			isset($_GET['id_clasificacion_servicio'] ) ? $_GET['id_clasificacion_servicio'] : null,
			isset($_GET['retenciones'] ) ? $_GET['retenciones'] : null,
			isset($_GET['impuestos'] ) ? $_GET['impuestos'] : null,
			isset($_GET['descuento'] ) ? $_GET['descuento'] : null,
			isset($_GET['margen_utilidad'] ) ? $_GET['margen_utilidad'] : null,
			isset($_GET['descripcion'] ) ? $_GET['descripcion'] : null,
			isset($_GET['garantia'] ) ? $_GET['garantia'] : null,
			isset($_GET['nombre'] ) ? $_GET['nombre'] : null
			
			);
		}catch(Exception $e){
 			Logger::error($e);
			throw new ApiException( $this->error_dispatcher->invalidDatabaseOperation() );
		}
 	}
  }
  
  
  
  
  
  
