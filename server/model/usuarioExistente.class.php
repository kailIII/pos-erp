﻿<?php
class usuarioExistente extends usuario {
		public function __construct($id) {
			$this->bd=new bd_default();
			$this->obtener_datos($id);
		}
	}
?>