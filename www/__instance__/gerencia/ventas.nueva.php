<?php 



		define("BYPASS_INSTANCE_CHECK", false);

		require_once("../../../server/bootstrap.php");

		$page = new GerenciaComponentPage();

		
		$page->addComponent( new ShoppingCartComponent(  ) );


		$page->render();
