<?php
class productosProveedorExistente extends productos_proveedor {
		public function __construct($id) {
			$this->bd=new bd_default();
			$this->obtener_datos($id);
		}
	}
?>
