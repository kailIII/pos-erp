<?php


    define("BYPASS_INSTANCE_CHECK", false);

    require_once("../../../server/bootstrap.php");

	$page = new GerenciaTabPage( );


    //
    // Parametros necesarios
    // 
	if(isset($_GET["uid"]) && !isset($_GET["id_usuario"])){
		$_GET["id_usuario"] = $_GET["uid"];
	}
	
	if(isset($_GET["id_usuario"]) && !isset($_GET["uid"])){
		$_GET["uid"] = $_GET["id_usuario"];
	}
	
    $page->requireParam("uid", "GET", "Este usuario no existe.");

    $este_usuario   = UsuarioDAO::getByPK($_GET["uid"]);
    $esta_direccion = DireccionDAO::getByPK($este_usuario->getIdDireccion());
   
    if (is_null($esta_direccion)){
        $esta_direccion = new Direccion();
	}


	//
	// Titulo de la pagina
	// 
	$page->addComponent(new TitleComponent( R::DescripcionRolFromId( $este_usuario->getIdRol() ), 3));
	$page->addComponent(new TitleComponent($este_usuario->getNombre(), 2));

	$page->nextTab("General");
	//
	// Menu de opciones
	// 

	$menu = new MenuComponent();
	$menu->addItem("Editar este usuario", "personal.editar.usuario.php?uid=" . $_GET["uid"]);

	$btn_eliminar = new MenuItem("Desactivar este usuario", null);
	$btn_eliminar->addApiCall("api/personal/usuario/eliminar");
	$btn_eliminar->onApiCallSuccessRedirect("personal.lista.usuario.php");
	$btn_eliminar->addName("eliminar");

	$funcion_eliminar = " function eliminar_usuario(btn){" . "if(btn == 'yes')" . "{" . "var p = {};" . "p.id_usuario = " . $_GET["uid"] . ";" . "sendToApi_eliminar(p);" . "}" . "}" . "      " . "function confirmar(){" . " Ext.MessageBox.confirm('Desactivar', 'Desea eliminar este usuario?', eliminar_usuario );" . "}";

	$btn_eliminar->addOnClick("confirmar", $funcion_eliminar);
	if ($este_usuario->getActivo()) {        
	$menu->addMenuItem($btn_eliminar);
	}


	$page->addComponent($menu);

    //
    // Forma de producto
    // 
    $form = new DAOFormComponent($este_usuario);
    $form->setEditable(false);
    $form->hideField(array(
		"id_direccion",
		"id_direccion_alterna",
		"id_sucursal",
		"fecha_asignacion_rol",
		"fecha_alta",
		"fecha_baja",
		"activo",
		"last_login",
		"consignatario",
		"id_clasificacion_cliente",
		"id_clasificacion_proveedor",
		"tarifa_venta_obtenida",
		"tarifa_compra_obtenida",
		"id_tarifa_compra",
		"id_tarifa_venta",
		"saldo_del_ejercicio",
		"intereses_moratorios",
		"representante_legal",
		"pagina_web",
		"mensajeria",
		"denominacion_comercial",
		"dias_de_credito",
		"facturar_a_terceros",
		"limite_credito",
		"token_recuperacion_pass",
		"tiempo_entrega",
		"ventas_a_credito",
		"descuento",
		"dias_de_embarque",
		"cuenta_de_mensajeria",
		"password",
		"id_usuario"
    ));

	$form->setCaption("rfc", "RFC");
	$form->setCaption("id_moneda", "Moneda default");
	

	$form->setCaption("id_rol", "Rol");
	$form->setHelp("id_rol", "Rol");


    $form->createComboBoxJoin("id_ciudad", "nombre", CiudadDAO::getAll(), $esta_direccion->getIdCiudad());
    $form->createComboBoxJoin("id_rol", "nombre", RolDAO::getAll(), $este_usuario->getIdRol());
    $form->createComboBoxJoin("id_moneda", "nombre", MonedaDAO::getAll(), $este_usuario->getIdMoneda());
    $form->createComboBoxJoin("id_clasificacion_cliente", "nombre", ClasificacionClienteDAO::getAll(), $este_usuario->getIdClasificacionCliente());
    $form->createComboBoxJoin("id_clasificacion_proveedor", "nombre", ClasificacionProveedorDAO::getAll(), $este_usuario->getIdClasificacionProveedor());
	$form->createComboBoxJoinDistintName("id_tarifa_venta", "id_tarifa" ,"nombre",TarifaDAO::search(new Tarifa(array("id_tarifa"=>$este_usuario->getIdTarifaVenta()))));

    //      $form->makeObligatory(array( 
    //              "compra_en_mostrador",
    //              "costo_estandar",
    //              "nombre_producto",
    //              "id_empresas",
    //              "codigo_producto",
    //              "metodo_costeo",
    //              "activo"
    //          ));
    //      $form->createComboBoxJoin("id_unidad", "nombre", UnidadDAO::getAll(), $este_producto->getIdUnidad() );
    
    $page->addComponent($form);



/* ********************************************************
	 *	Direccion
	 *
* ******************************************************** */

    $page -> nextTab("Direccion");

    $menu = new MenuComponent();
	$menu->addItem("Editar Direccion","personal.editar.direccion.php?uid=".$este_usuario->getIdUsuario()."&did=".$este_usuario->getIdDireccion() );
	$page->addComponent($menu);



	$direccion = $este_usuario->getIdDireccion();
	$direccionObj = DireccionDAO::getByPK( $direccion );

	if(is_null($direccionObj)){
		
		
		
	}else{

		$ciudad = CiudadDAO::getByPK( $direccionObj->getIdCiudad() );

		if(null === $ciudad){
			$ciudad = new Ciudad();
		}


		$page->addComponent(new FreeHtmlComponent("<div id=\"map_canvas\"></div>"));
		$page->addComponent(new FreeHtmlComponent("<script>startMap(\""
																. $direccionObj->getCalle() 
																. " "
																. $direccionObj->getNumeroExterior() 
																. ", "
																. $direccionObj->getColonia() 
																. ", "
																. $ciudad->getNombre() 
																. "\");</Script>"));
	}

	if(!is_null($direccionObj)){
		$usr_ultima = UsuarioDAO::getByPK($direccionObj->getIdUsuarioUltimaModificacion());	
		
		if(!is_null($usr_ultima))	
			$direccionObj->setIdUsuarioUltimaModificacion( $usr_ultima->getNombre() );

		$dform = new DAOFormComponent( $direccionObj );
		$dform->setEditable(false);		
		$dform->hideField( array( 
				"id_direccion",
				"id_usuario_ultima_modificacion",
				"ultima_modificacion"
			 ));		
		$dform->createComboBoxJoin("id_ciudad","nombre",CiudadDAO::getAll(), $direccionObj->getIdCiudad());
		$page->addComponent( $dform );
	}

   /*     if (!is_null($este_usuario->getIdDireccion())) {
        $page->addComponent(new TitleComponent("Direccion"));
        
        $form = new DAOFormComponent($esta_direccion);
        
        $form->hideField(array(
            "id_direccion",
            "id_usuario_ultima_modificacion",
            "ultima_modificacion"
        ));
        
        $form->setEditable(false);
        
        $form->createComboBoxJoin("id_ciudad", "nombre", CiudadDAO::getAll(), $esta_direccion->getIdCiudad());
        
        $page->addComponent($form);
        
    }

    if (!is_null($este_usuario->getIdDireccionAlterna())) {
        $page->addComponent(new TitleComponent("Direccion"));
        $esta_direccion = DireccionDAO::getByPK($este_usuario->getIdDireccionAlterna());
        $form           = new DAOFormComponent($esta_direccion);
        
        $form->hideField(array(
            "id_direccion"
        ));
        
        $form->setEditable(false);
        
        $form->createComboBoxJoin("id_ciudad", "id_ciudad", CiudadDAO::getAll());
        
        $page->addComponent($form);
        
    }

    
	$page->partialRender();
	
	#inicia lo de la dir
	$direccion = $este_usuario->getIdDireccion();
	$direccionObj = DireccionDAO::getByPK( $direccion );

	if(is_null($direccionObj)){
		
		
		
	}else{

		$ciudad = CiudadDAO::getByPK( $direccionObj->getIdCiudad() );

		if(null === $ciudad){
			$ciudad = new Ciudad();
		}


		$page->addComponent(new FreeHtmlComponent("<div id=\"map_canvas\"></div>"));
		$page->addComponent(new FreeHtmlComponent("<script>startMap(\""
																. $direccionObj->getCalle() 
																. " "
																. $direccionObj->getNumeroExterior() 
																. ", "
																. $direccionObj->getColonia() 
																. ", "
																. $ciudad->getNombre() 
																. "\");</script>"));
	}
	*/

	/* * *******************************************************
	 * 	Seguimientos
	 *
	 * ******************************************************** */
	$page->nextTab("Seguimiento");

	$segs = UsuarioSeguimientoDAO::search(new UsuarioSeguimiento(array(
	                    "id_usuario" => $este_usuario->getIdUsuario()
	                )));

	$header = array(
	    "texto" => "Descripcion",
	    "fecha" => "Fecha",
	    "id_usuario" => "Agente"
	);

	$lseguimientos = new TableComponent($header, $segs);
	$lseguimientos->addColRender("id_usuario", "R::UserFullNameFromId");
	$lseguimientos->addColRender("fecha", "R::FriendlyDateFromUnixTime");
	$page->addComponent($lseguimientos);


	$page->addComponent("<script>
				function newcommentDone(a,b,c){
					console.log(a,b,c)
				}
			</script>");

	$nseguimiento = new DAOFormComponent(new ClienteSeguimiento(array("id_usuario" => $este_usuario->getIdUsuario())));
	$nseguimiento->onApiCallSuccess("newcommentDone");
	$nseguimiento->addApiCall("api/personal/usuario/seguimiento/nuevo");
	$nseguimiento->settype("texto", "textarea");
	$nseguimiento->hideField(array(
	    "id_usuario",
	    "id_cliente",
	    "id_cliente_seguimiento",
	    "fecha"
	));
	$nseguimiento->sendHidden("id_usuario");
	$page->addComponent($nseguimiento);


	/* * *******************************************************
	 * 	Just created
	 *
	 * ******************************************************** */
	if(	isset($_GET["just_created"]) 
		&& ($_GET["just_created"] == 1)
		&& ($este_usuario->getCorreoElectronico() !== null ) 
	){
		?>
		<script type="text/javascript" charset="utf-8">
			
				function enviarCorreo(){
					POS.API.POST("api/pos/mail/enviar", 
						{
							cuerpo : "Bienvenido a su cuenta en pos ERP, ingrese en la siguiente direccion: http://www.caffeina.mx/pos/<?php echo INSTANCE_TOKEN; ?>/ ",
							destinatario : "<?php echo $este_usuario->getCorreoElectronico(); ?>", 
							titulo : "Bienvenido a POS ERP"
						}, 
						{
							callback : function( a ){ 
								console.log(a);
							}
						});
					Ext.MessageBox.alert('Enviando correo', 'Se ha enviado un correo a <?php echo $este_usuario->getCorreoElectronico(); ?>.');
				}
				
				
				var win;
				
				var required = '';

				html = "<table ><tr ><td>"
							+"<img src='../../../media/1335388431_Forward.png'>"
							+"</td><td style='vertical-align:top'><br>"
							+"<h1>Dele la bienvenida a <?php echo $este_usuario->getNombre(); ?></h1>"
							+"<p>&iquest; Desea enviar un correo a <?php echo $este_usuario->getNombre(); ?> <span style='color:gray'>(<?php echo $este_usuario->getCorreoElectronico(); ?>)</span> para darle una"
							+ " breve introduccion a POS ERP ?</p>"
							+"</td></tr></table>";

			    function showContactForm() {
			        if (!win) {
			            var form = Ext.widget('form', {
			                layout: {
			                    type: 'vbox',
			                    align: 'stretch'
			                },
			                border: false,
			                bodyPadding: 5,
							html : html,
			                buttons: [{
			                    text: 'No enviar',
			                    handler: function() {
			                        this.up('form').getForm().reset();
			                        this.up('window').hide();
			                    }
			                }, {
			                    text: 'Enviar',
			                    handler: function() {
			                        if (this.up('form').getForm().isValid()) {
			                            // In a real application, this would submit the form to the configured url
			                            // this.up('form').getForm().submit();
			                            this.up('form').getForm().reset();
			                            this.up('window').hide();
										enviarCorreo();
			                        }
			                    }
			                }]
			            });

			            win = Ext.widget('window', {
			                title: 'Nuevo personal creado correctamente',
			                closeAction: 'hide',
			                width: 450,
			                height: 190,
			                layout: 'fit',
			                resizable: false,
			                modal: true,
			                items: form
			            });
			        }
			        win.show();
			    }


				setTimeout("showContactForm()", 450);
		</script>
		<?php
	}

	$page->render();
