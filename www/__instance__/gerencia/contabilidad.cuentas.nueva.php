<?php 



		define("BYPASS_INSTANCE_CHECK", false);

		require_once("../../../server/bootstrap.php");

		$page = new GerenciaComponentPage();

	$page->addComponent( new TitleComponent( "Nueva Cuenta" ) );
    $page->requireParam(  "idcc", "GET", "Este catalogo de cuentas no existe." );
	//forma de nueva caja
    $page->addComponent( "<div class='POS Boton' onClick='window.location=\"contabilidad.cuentas.php?idcc={$_GET["idcc"]}\"'> << Regresar</div> " );
	$form = new DAOFormComponent( array( new CuentaContable() ) );
    $controller = new ContabilidadController();
    $catalogo = $controller::DetalleCatalogoCuentas( $_GET["idcc"] );
	
	$form->hideField( array( 
						"id_cuenta_contable",
						"clave",
						"nivel",
						"consecutivo_en_nivel",
						"afectable",
						"activa"
		 ));

	$form->addApiCall( "api/contabilidad/cuenta/nueva" );
    $form->onApiCallSuccessRedirect("contabilidad.cuentas.nueva.php?idcc={$_GET['idcc']}");

    $form->createComboBoxJoin("id_catalogo_cuentas", "id_catalogo_cuentas", 
                        array(
                                array( "id" => $_GET["idcc"], "caption" => $catalogo["descripcion"] )
                            ),
                        $_GET["idcc"]
                        );
    $form->createComboBoxJoin("naturaleza", "naturaleza", 
                        array(
                            array( "id" => "Acreedora", "caption" => "Acreedora" ),
                            array( "id" => "Deudora", "caption" => "Deudora"  ) 
                            )
                        );
    $form->createComboBoxJoin("tipo_cuenta", "tipo_cuenta", 
                        array(
                            array( "id" => "Balance", "caption" => "Balance" ),
                            array( "id" => "Estado de Resultados", "caption" => "Estado de Resultados" ) 
                            )
                        );
    $form->createComboBoxJoin("es_cuenta_orden", "es_cuenta_orden", 
                        array(
                            array( "id" => 0, "caption" => "No" ),
                            array( "id" => 1, "caption" => "Si"  ) 
                            )
                        );
    $form->createComboBoxJoin("es_cuenta_mayor", "es_cuenta_mayor", 
                        array(
                            array( "id" => 0, "caption" => "No" ),
                            array( "id" => 1, "caption" => "Si"  ) 
                            )
                        );
    $form->createComboBoxJoin("clasificacion", "clasificacion", 
                        array(
                            array( "id" => "Activo Circulante", "caption" => "Activo Circulante" ),
                            array( "id" => "Activo Fijo", "caption" => "Activo Fijo"  ),
                            array( "id" => "Activo Diferido", "caption" => "Activo Diferido"  ),
                            array( "id" => "Pasivo Circulante", "caption" => "Pasivo Circulante"  ),
                            array( "id" => "Pasivo Largo Plazo", "caption" => "Pasivo Largo Plazo"  ),
                            array( "id" => "Capital Contable", "caption" => "Capital Contable"  ),
                            array( "id" => "Ingresos", "caption" => "Ingresos"  ),
                            array( "id" => "Egresos", "caption" => "Egresos"  )
                            )
                        );
    $form->createComboBoxJoin("abonos_aumentan", "abonos_aumentan", 
                        array(
                            array( "id" => 0, "caption" => "No" ),
                            array( "id" => 1, "caption" => "Si"  ) 
                            )
                        );
    $form->createComboBoxJoin("cargos_aumentan", "cargos_aumentan", 
                        array(
                            array( "id" => 0, "caption" => "No" ),
                            array( "id" => 1, "caption" => "Si"  ) 
                            )
                        );

$form->makeObligatory(array( 
			"nombre_cuenta",
			"naturaleza",
			"clasificacion",
			"tipo_cuenta",
			"es_cuenta_mayor",
			"es_cuenta_orden",
			"abonos_aumentan",
			"cargos_aumentan",
            "id_catalogo_cuentas"
		));

	$ctas = ContabilidadController::BuscarCuenta($_GET["idcc"]);

    $cuentas = array();
    //para enviar el id de cuenta contable en el combo de id_cuenta_padre se debe hacer este foreach
    foreach ($ctas["resultados"] as $cta) {
        array_push($cuentas,array("id"=>$cta->getIdCuentaContable(),"caption"=>$cta->getNombreCuenta()));
    }
    //se llena el combo con los ids cambiados para que no se envien los id_cuenta_padre si no el id de la cuenta
	$form->createComboBoxJoin( "id_cuenta_padre", "nombre_cuenta", $cuentas );
	
	$page->addComponent( $form );

	//render the page
	$page->render();
