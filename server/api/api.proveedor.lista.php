<?php
/**
  * GET api/proveedor/lista
  * Obtener una lista de proveedores.
  *
  * Obtener una lista de proveedores. Puede filtrarse por activo o inactivos, y puede ordenarse por sus atributos.
  *
  *
  *
  **/

  class ApiProveedorLista extends ApiHandler {
  

	protected function DeclareAllowedRoles(){  return BYPASS;  }
	protected function CheckAuthorization() {}
	protected function GetRequest()
	{
		$this->request = array(	
			"activo" => new ApiExposedProperty("activo", false, GET, array( "bool" )),
			"ordenar" => new ApiExposedProperty("ordenar", false, GET, array( "json" )),
		);
	}

	protected function GenerateResponse() {		
		try{
 		$this->response = ProveedoresController::Lista( 
 			
			
			isset($_GET['activo'] ) ? $_GET['activo'] : null,
			isset($_GET['ordenar'] ) ? $_GET['ordenar'] : null
			
			);
		}catch(Exception $e){
 			Logger::error($e);
			throw new ApiException( $this->error_dispatcher->invalidDatabaseOperation() );
		}
 	}
  }
  
  
  
  
  
  