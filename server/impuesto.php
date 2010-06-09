<?php include_once("libBD.php");
	class impuesto{
		var $id_impuesto;	 	 	 	 	 	 	
		var $descripcion;	 	 	 	 	 	 	
		var $valor;	 	 	
		var $bd;
		
		function __construct($descripcion,$valor){ 	 	
			$this->descripcion=$descripcion;	 	 	 	 	 	 	
			$this->valor=$valor;
			$this->bd=new bd_default();
		}
		function __destruct(){ 
			 return; 
		}
		
		function inserta(){
			$insert="INSERT INTO impuesto values(null,?,?);";
			$params=array($this->descripcion,$this->valor);
			if($this->bd->ejecuta($insert,$params)){
				$query="select max(id_impuesto) from impuesto;";
				$this->id_impuesto=$this->bd->select_un_campo($query,array());
				return true;
			}else return false;
		}
		function actualiza(){
			$update="UPDATE impuesto SET descripcion=?, valor=? where id_impuesto=?";
			$params=array($this->descripcion,$this->valor,$this->id_impuesto);
			return $this->bd->ejecuta($update,$params);
		}
		function json(){
			$query="select * from impuesto where id_impuesto =?;";
			$params=array($this->id_impuesto);
			return $this->bd->select_json($query,$params);
		}
		function borra (){
			$query="delete from impuesto where  id_impuesto =?;";
			$params=array($this->id_impuesto);
			return $this->bd->ejecuta($query,$params);
		}
		function obtener_datos($id){
			$query="select * from impuesto where id_impuesto =?;";
			$params=array($id);
			$datos=$this->bd->select_uno($query,$params);
			$this->id_impuesto=$datos[id_impuesto];	
			$this->descripcion=$datos[descripcion];	
			$this->valor=$datos[valor];	
		}
		function existe(){
			$query="select id_impuesto from impuesto where id_impuesto=?;";
			$params=array($this->id_impuesto);
			return $this->bd->existe($query,$params);
		}
	}
	class impuesto_vacio extends impuesto {      
		public function __construct() {
			$this->bd=new bd_default();
		}
	}
	class impuesto_existente extends impuesto {
		public function __construct($id) {
			$this->bd=new bd_default();
			$this->obtener_datos($id);
		}
	}
?>