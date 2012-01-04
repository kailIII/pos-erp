<?php 



		define("BYPASS_INSTANCE_CHECK", false);

		require_once("../../../../server/bootstrap.php");

		$page = new GerenciaComponentPage();

                //
		// Requerir parametros
		// 
		$page->requireParam(  "cid", "GET", "Esta compra no existe." );
		$esta_compra = CompraDAO::getByPK( $_GET["cid"] );
                
		
		
		//
		// Titulo de la pagina
		// 
		$page->addComponent( new TitleComponent( "Detalles de la compra " . $esta_compra->getIdCompra() , 2 ));

		
		//
		// Menu de opciones
		// 
                if(!$esta_compra->getCancelada())
                {
                    $menu = new MenuComponent();
                    
                    if($esta_compra->getTipoDeCompra()=="credito")
                    {
                        $menu->addItem("Abonar a esta compra", "cargos_y_abonos.nuevo.abono.php?cid=".$_GET["cid"]."&did=".$esta_compra->getIdVendedorCompra());
                    }
                    
                    $btn_eliminar = new MenuItem("Cancelar esta compra", null);
                    $btn_eliminar->addApiCall("api/compras/cancelar", "GET");
                    $btn_eliminar->onApiCallSuccessRedirect("compras.lista.php");
                    $btn_eliminar->addName("cancelar");

                    $funcion_eliminar = " function eliminar_empresa(btn){".
                                "if(btn == 'yes')".
                                "{".
                                    "var p = {};".
                                    "p.id_compra = ".$_GET["cid"].";".
                                    "sendToApi_cancelar(p);".
                                "}".
                            "}".
                            "      ".
                            "function confirmar(){".
                            " Ext.MessageBox.confirm('Desactivar', 'Desea cancelar esta compra?', eliminar_empresa );".
                            "}";

                    $btn_eliminar->addOnClick("confirmar", $funcion_eliminar);

                    $menu->addMenuItem($btn_eliminar);

                    $page->addComponent( $menu);
                }
		
		//
		// Forma de producto
		// 
		$form = new DAOFormComponent( $esta_compra );
		
		$form->setEditable(false);

		$form->hideField( array( 
				"id_compra",
                                "id_caja",
                                "id_compra_caja",
                                "id_vendedor_compra",
                                "id_sucursal",
                                "id_usuario",
                                "id_empresa"
			 ));
		
		$page->addComponent( $form );
                
                $page->addComponent( new TitleComponent( "Productos de esta compra" ), 3 );
                
                $tabla = new TableComponent(
                        array(
                                "id_producto"       => "Producto",
                                "id_unidad"         => "Unidad",
                                "cantidad"          => "Cantidad",
                                "precio"            => "Precio Unitario",
                                "descuento"         => "Descuento",
                                "impuesto"          => "Impuesto",
                                "retencion"         => "Retencion"
                        ),
                         CompraProductoDAO::search( new CompraProducto( array( "id_compra" => $_GET["cid"] ) ) )
                        );
                
                function funcion_producto($id_producto)
                {
                    return ProductoDAO::getByPK($id_producto) ? ProductoDAO::getByPK($id_producto)->getNombreProducto() : "---------";
                }
                
                $tabla->addColRender("id_producto", "funcion_producto");
                
                $page->addComponent($tabla);
                
                $page->addComponent( new TitleComponent( "Informacion de Arpilla" ), 3 );
                
                $tabla = new TableComponent(
                        array(
                                "folio"             => "Folio",
                                "productor"         => "Productor",
                                "numero_de_viaje"   => "Numero de viaje",
                                "fecha_origen"      => "Fecha en que se envio",
                                "peso_origen"       => "Peso en el origen",
                                "peso_recibido"     => "Peso recibido",
                                "arpillas"          => "Arpillas",
                                "peso_por_arpilla"  => "Peso por arpilla",
                                "merma_por_arpilla" => "Merma por arpilla",
                                "total_origen"      => "Total en el origen"
                        ),
                         CompraArpillaDAO::search( new CompraArpilla( array( "id_compra" => $_GET["cid"] ) ) )
                        );
                
                $page->addComponent( $tabla );
                
		$page->render();
