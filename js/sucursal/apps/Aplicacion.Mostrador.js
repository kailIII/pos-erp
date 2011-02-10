/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, maxerr: 1590, maxlen: 80 */

Aplicacion.Mostrador = function ()
{

	return this._init();
};




Aplicacion.Mostrador.prototype._init = function () {
	if(DEBUG){
		console.log("Mostrador: construyendo");
	}

	
	//crear el panel del mostrador
	this.mostradorPanelCreator();
	
	//crear la forma de la busqueda de clientes
	this.buscarClienteFormCreator();
	
	//crear la forma de ventas
	//this.doVentaPanelCreator();
	this.doNuevaVentaPanelCreator();
	
	//crear la forma de que todo salio bien en la venta
	this.finishedPanelCreator();
	
	Aplicacion.Mostrador.currentInstance = this;
	
	//obtiene la informacion del carrito
	Aplicacion.Mostrador.currentInstance.getInfoSucursal();
	
	
	return this;
};




Aplicacion.Mostrador.prototype.getConfig = function (){
	return {
		text: 'Mostrador',
		cls: 'launchscreen',
		card: this.mostradorPanel,
		leaf: true
		};
};


/* ********************************************************
	Información de la sucursal
******************************************************** */

Aplicacion.Mostrador.prototype.infoSucursal = null;

Aplicacion.Mostrador.prototype.getInfoSucursal = function()
{
	
	var info = null;
	
	if(DEBUG){
		console.log("Obteniendo información de la sucursal ....");
	}
	
	Ext.Ajax.request({
		url: '../proxy.php',
		scope : this,
		params : {
			action : 712,
		},
		success: function(response, opts) {
			try{
				informacion = Ext.util.JSON.decode( response.responseText );				
			}catch(e){
				return POS.error(response, e);
			}
			
			if( !informacion.success ){
				//volver a intentar
				if(DEBUG){
					console.log("obtenicion de la informacion sin exito ",venta );
				}
				Ext.Msg.alert("Mostrador", informacion.reason);
				return;

			}
			
			if(DEBUG){
				console.log("obtenicion de la informacion exitosa ", venta );
			}
						
			Aplicacion.Mostrador.currentInstance.infoSucursal = informacion.datos;		
			
			if(DEBUG){
				console.log("Aplicacion.Mostrador.currentInstance.infoSucursal contiene : ", Aplicacion.Mostrador.currentInstance.infoSucursal);	
			}

		},
		failure: function( response ){
			POS.error( response );
		}
	});
	
	
};



/* ********************************************************
	Panel Forma de pago
******************************************************** */



/* ********************************************************
	Funciones del carrito
******************************************************** */
/*
 *	Estructura donde se guardaran los detalles de la venta actual.
 * */
Aplicacion.Mostrador.prototype.carrito = {
	tipo_venta : null,
	items : [],
	cliente : null,
	venta_preferencial : { cliente : null, id_autorizacion : null },
	factura : false,
	tipo_pago: null
};


Aplicacion.Mostrador.prototype.cancelarVenta = function ()
{

	Aplicacion.Mostrador.currentInstance.carrito.items = [];

	Aplicacion.Mostrador.currentInstance.refrescarMostrador();
	
	Aplicacion.Mostrador.currentInstance.setCajaComun();

};

Aplicacion.Mostrador.prototype.carritoCambiarCantidad = function ( id, qty, forceNewValue )
{
	var carrito = Aplicacion.Mostrador.currentInstance.carrito.items;
	
	for (var i = carrito.length - 1; i >= 0; i--){
	
	
		if( carrito[i].idUnique == id ){
			
			if(forceNewValue){
				carrito[i].cantidad = qty;
			}else{
				carrito[i].cantidad += qty;
			}
			
			if(carrito[i].cantidad <= 0){
				carrito[i].cantidad = 1;
			}
			
			this.refrescarMostrador();
			break;
		}
	}
	
};

Aplicacion.Mostrador.prototype.refrescarMostrador = function (	)
{	
	carrito = Aplicacion.Mostrador.currentInstance.carrito;
	
	var html = "<table border=0>";
	
	html += "<tr class='top'>";
	html +=     "<td align='left'>Descripcion</td>";
	html +=     "<td colspan=2>&nbsp</td>";
	html +=     "<td align='center' colspan=3>Cantidad</td>";	
	html +=     "<td align='left' >Precio</td>";
	html +=     "<td align='left' >Sub Total</td>";
	html += "</tr>";
	
	for (var i=0; i < carrito.items.length; i++){
		
		if( i == carrito.items.length - 1 ){
			html += "<tr class='last'>";
		}else{
			html += "<tr >";		
		}
		html += "<td style='width: 25%;' ><b>" + carrito.items[i].id_producto + "</b> " + carrito.items[i].descripcion+ "</td>";
		
		html += "<td style='width: 15%;' ><div id='Mostrador-carritoTratamiento"+ carrito.items[i].idUnique +"'></div></td>";

		html += "<td  align='right' style='width: 12%;'> <span class='boton'  onClick=\"Aplicacion.Mostrador.currentInstance.quitarDelCarrito('"+ carrito.items[i].idUnique +"')\"><img src='../media/icons/close_16.png'>&nbsp;Quitar&nbsp;</span></td>";

		html += "<td  align='center'  style='width: 8.1%;'> <span class='boton' onClick=\"Aplicacion.Mostrador.currentInstance.carritoCambiarCantidad('"+ carrito.items[i].idUnique + "', -1, false)\">&nbsp;-&nbsp;<img src='../media/icons/arrow_down_16.png'></span></td>";

		html += "<td  align='center'  style='width: 6.3%;' ><div id='Mostrador-carritoCantidad"+ carrito.items[i].idUnique +"'></div></td>";

		html += "<td  align='center'  style='width: 8.1%;'> <span class='boton' onClick=\"Aplicacion.Mostrador.currentInstance.carritoCambiarCantidad('"+ carrito.items[i].idUnique +"', 1, false)\"><img src='../media/icons/arrow_up_16.png'>&nbsp;+&nbsp;</span></td>";

		html += "<td style='width: 10.4%;'> <div  id='Mostrador-carritoPrecio"+ carrito.items[i].idUnique +"'></div></td>";
		
		html += "<td  style='width: 11.3%;'>" + POS.currencyFormat( carrito.items[i].cantidad * carrito.items[i].precio )+"</td>";
		
		html += "</tr>";
	}
	
	html += "</table>";
	
	Ext.getCmp("MostradorHtmlPanel").update(html);
	
	//si hay mas de un producto, mostrar el boton de vender
	if(carrito.items.length > 0){
		Ext.getCmp("Mostrador-mostradorVender").show( Ext.anims.slide );
	}else{
		Ext.getCmp("Mostrador-mostradorVender").hide( Ext.anims.slide );
	}
	
	for (i=0; i < carrito.items.length; i++){
		
		if(Ext.get("Mostrador-carritoCantidad"+ carrito.items[i].productoID + "Text")){
			continue;
		}
	
	   
		a = new Ext.form.Text({
			renderTo : "Mostrador-carritoCantidad"+ carrito.items[i].idUnique ,
			id : "Mostrador-carritoCantidad"+ carrito.items[i].idUnique + "Text",
			value : carrito.items[i].cantidad,
			prodID : carrito.items[i].id_producto,
			idUnique : carrito.items[i].idUnique,
			//width: 100,
			style:{
		         textAlign: 'center'
		    },
			placeHolder : "",
			listeners : {
				'focus' : function (){

					kconf = {
						type : 'num',
						submitText : 'Aceptar',
						callback : function ( campo ){

							//buscar el producto en la estructura y ponerle esa nueva cantidad
							for (var i=0; i < Aplicacion.Mostrador.currentInstance.carrito.items.length; i++) {
							
								if(Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique  == campo.idUnique ){
									Aplicacion.Mostrador.currentInstance.carrito.items[i].cantidad = parseFloat( campo.getValue() );
									break;
								}
							}
							
							Aplicacion.Mostrador.currentInstance.refrescarMostrador();
						}
					};
					
					POS.Keyboard.Keyboard( this, kconf );
				}
			}
		
		});

		b = new Ext.form.Text({
			renderTo : "Mostrador-carritoPrecio"+ carrito.items[i].idUnique ,
			id : "Mostrador-carritoPrecio"+ carrito.items[i].idUnique + "Text",
			value : POS.currencyFormat( carrito.items[i].precio ),
			prodID : carrito.items[i].id_producto,
			idUnique : carrito.items[i].idUnique,			
			placeHolder : "Precio de Venta",
			listeners : {
				'focus' : function (a){
					
					this.setValue( this.getValue().replace("$", '').replace(",", "") );
					
					kconf = {
						type : 'num',
						submitText : 'Cambiar',
						callback : function ( campo ){
						
							//buscar el producto en la estructura y ponerle esa nueva cantidad
							for (var i=0; i < Aplicacion.Mostrador.currentInstance.carrito.items.length; i++) {

								if(Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique == campo.idUnique){
									
                                    precioVenta = ( Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == "true"  )?Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVenta : Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVentaSinProcesar ;
											
									//verificamos que sea una venta preferencial
									//haya un cliente_preferencial y un cliente y el id
											
									if( 
									        !( 
									        Aplicacion.Mostrador.currentInstance.carrito.cliente != null &&  
									        Aplicacion.Mostrador.currentInstance.carrito.venta_preferencial.cliente != null &&
									        Aplicacion.Mostrador.currentInstance.carrito.cliente.id_cliente == Aplicacion.Mostrador.currentInstance.carrito.venta_preferencial.cliente.id_cliente
									        )
									    )
									{
									    //aqui no entra a la venta preferencial 
									    if( parseFloat(campo.getValue()) < parseFloat( precioVenta) ){
										    Ext.Msg.alert("Mostrador", "No puede bajar un precio por debajo del preestablecido.");
										    Aplicacion.Mostrador.currentInstance.carrito.items[i].precio = precioVenta;
										    break;
									    }
									}		
											
									
									
									    var error = false;
									
									    //verificamos que no exista 2 productos con las mismas caracteristicas pero con precio diferente
							            for(var j=0; j < Aplicacion.Mostrador.currentInstance.carrito.items.length; j++){
							                
							                if( Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique == Aplicacion.Mostrador.currentInstance.carrito.items[j].idUnique ){
                                                continue;
                                            }
							                
                                            if( 
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].id_producto == Aplicacion.Mostrador.currentInstance.carrito.items[j].id_producto &&
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == Aplicacion.Mostrador.currentInstance.carrito.items[j].procesado &&
                                                parseFloat( campo.getValue() ) != Aplicacion.Mostrador.currentInstance.carrito.items[j].precio
                                             ){
                                                descripcion = ( Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == "true" )?"Limpia":"Original";
                                                Ext.Msg.alert( "Alerta","Existen 2 procuctos " + Aplicacion.Mostrador.currentInstance.carrito.items[i].descripcion + " " + descripcion + " con diferente precio.");
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].precio= parseFloat(Aplicacion.Mostrador.currentInstance.carrito.items[j].precio)
                                                error = true;
                                                break;
                                            }
							                
							            }
							            
							            if(error){
							                break;
							            }
									
									
									
									Aplicacion.Mostrador.currentInstance.carrito.items[i].precio= parseFloat( campo.getValue() );
									break;
								}
							}
							
							Aplicacion.Mostrador.currentInstance.refrescarMostrador();
						}
					};
					
					POS.Keyboard.Keyboard( this, kconf );
				}
			} 
		
		});

		 if(carrito.items[i].tratamiento != null){
		 
		    c = new Ext.form.Select({
			    renderTo : "Mostrador-carritoTratamiento"+ carrito.items[i].idUnique ,
			    id : "Mostrador-carritoTratamiento"+ carrito.items[i].idUnique + "Select",
			    idUnique : carrito.items[i].idUnique,
			    value : carrito.items[i].procesado,
			    style:{
		             width: '100%'
		        }, 
                options : [
                    {
                        text : "Limpia",
                        value : "true"
                    },{
                        text : "Original",
                        value : "false"
                    }
                ],
                listeners : {
                    "change" : function (){
                     
                        //iteramos el arreglo de productos
                        for (var i=0; i < Aplicacion.Mostrador.currentInstance.carrito.items.length; i++) {
                        
                            //obtemeteomos el producto
                            if(Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique == this.idUnique){
					
					                //guardamos la seleccion
					                Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado = this.value;		
					                
					                //reconocemos si es un producto procesado o no
					                if( Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == "true" ){

                                        //verificamos que no existan 2 productos con las mismas caracteristicas pero con precio diferente
                                        var found = false;
									    
							            for(var j = 0; j < Aplicacion.Mostrador.currentInstance.carrito.items.length; j++){
							                
							                if( Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique == Aplicacion.Mostrador.currentInstance.carrito.items[j].idUnique ){
                                                continue;
                                            }
							                
                                            if( 
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].id_producto == Aplicacion.Mostrador.currentInstance.carrito.items[j].id_producto &&
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == Aplicacion.Mostrador.currentInstance.carrito.items[j].procesado                                                
                                             ){              
                                                //si encuentra un producto con las mismas caracteristicas, entonces a este producto le asignamos el mismo precio, para que no haya 2 productos iguales pero con diferente precio                                  
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].precio= parseFloat(Aplicacion.Mostrador.currentInstance.carrito.items[j].precio)
                                                found = true;
                                                break;
                                            }
							                
							            }
							            
							            if(found ){
							                break;
							            }else{
							                //si no se encontro un producto con las mismas propiedades entonces le asignamos el valos por default
							                Aplicacion.Mostrador.currentInstance.carrito.items[i].precio = Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVenta;
							            }
					                    
					                }else{
					                
					                    //verificamos que no existan 2 productos con las mismas caracteristicas pero con precio diferente					                    
                                        var found  = false;

							            for(var j=0; j < Aplicacion.Mostrador.currentInstance.carrito.items.length; j++){
							                
							                if( Aplicacion.Mostrador.currentInstance.carrito.items[i].idUnique == Aplicacion.Mostrador.currentInstance.carrito.items[j].idUnique ){
                                                continue;
                                            }
							                
                                            if( 
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].id_producto == Aplicacion.Mostrador.currentInstance.carrito.items[j].id_producto &&
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == Aplicacion.Mostrador.currentInstance.carrito.items[j].procesado                                
                                             ){            
                                                 //si encuentra un producto con las mismas caracteristicas, entonces a este producto le asignamos el mismo precio, para que no haya 2 productos iguales pero con diferente precio                                                                         
                                                Aplicacion.Mostrador.currentInstance.carrito.items[i].precio= parseFloat(Aplicacion.Mostrador.currentInstance.carrito.items[j].precio)
                                                found = true;
                                                break;
                                            }
							                
							            }
							            
							            if(found ){
							                break;
							            }else{
							                 //si no se encontro un producto con las mismas propiedades entonces le asignamos el valos por default
					                        Aplicacion.Mostrador.currentInstance.carrito.items[i].precio = Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVentaSinProcesar;
					                    }
					                }
					                
					                
                                if(DEBUG){
                                    console.log("El producto " + this.idUnique + " esta  procesado ?"  + Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado );	
                                    console.log( "Todos los productos : " + Aplicacion.Mostrador.currentInstance.carrito.items );	                            
                                }	
                            }
                        }
                        
                        //refrescar el html
	                    Aplicacion.Mostrador.currentInstance.refrescarMostrador();
				        
                    }//change
                }//listeners
	
		    });//c
		    
        }//if
		
	}//for
	
};


	
Aplicacion.Mostrador.prototype.agregarProducto = function (	 )
{	
	val = Aplicacion.Mostrador.currentInstance.mostradorPanel.getDockedComponent(0).getComponent(0).getValue();
	Aplicacion.Mostrador.currentInstance.mostradorPanel.getDockedComponent(0).getComponent(0).setValue("");
	Aplicacion.Mostrador.currentInstance.agregarProductoPorID(val);
};


Aplicacion.Mostrador.prototype.agregarProductoPorID = function ( id )
{

	//buscar el la estructura que esta en el Inventario
	inventario = Aplicacion.Inventario.currentInstance.inventarioListaStore;
	
	if(DEBUG){
		console.log("buscando el producto" + id);
		console.log("Aplicacion.Inventario.currentInstance.inventarioListaStore es : "  + Aplicacion.Inventario.currentInstance.inventarioListaStore );
	}
	
	res = inventario.findRecord("productoID", id, 0, false, true, true);


	
	if(res === null){
		Ext.Msg.alert("Mostrador", "Este producto no existe");		
		return;
	}

	
	if(DEBUG){
		console.log("Agregando el producto " + id + " al carrito.", res);
	}

	//buscar este producto en el carrito (solo se permiten 2 articulos iguales)
	for(var a = 0, found = false, incidencias = 0 ; a < this.carrito.items.length; a++)
	{
	
		if(this.carrito.items[a].id_producto == id)
		{
			//ya esta en el carrito, aumentar su cuenta
			incidencias ++;

			
			if( this.carrito.items[a].tratamiento == "" ){
			    found = true;
			    this.carrito.items[a].cantidad++;
			    break;
			}
			
			if( incidencias > 1 ){
			    Ext.Msg.alert("Alerta","El producto '" + res.data.descripcion + "' ya existe en el carrito.");
			    found = true;
			    break;
			}

		}
	}
	
	//si no, agregarlo al carrito
	if(!found)
	{
	
	    var len = this.carrito.items.length;
	
		this.carrito.items.push({
			descripcion: res.data.descripcion,
			existencias: res.data.existenciasOriginales,
			existencias_procesadas: res.data.existenciasProcesadas,
			tratamiento:res.data.tratamiento,   //si es !null  entonces el producto puede ser original o procesado
			precioVenta: res.data.precioVenta,
			precioVentaSinProcesar: res.data.precioVentaSinProcesar,
			precio: res.data.precioVenta, 
			id_producto: res.data.productoID,
			escala: res.data.medida,
			precioIntersucursal : res.data.precioIntersucursal,
			precioIntersucursalSinProcesar : res.data.precioIntersucursalSinProcesar,
			procesado : "true",
			cantidad : 1,
			idUnique : res.data.productoID + "_" +  Aplicacion.Mostrador.currentInstance.uniqueIndex
		});
		
		Aplicacion.Mostrador.currentInstance.uniqueIndex++; //identificador unico e irepetible
		
	}
	

	//refrescar el html
	this.refrescarMostrador();
};

Aplicacion.Mostrador.prototype.uniqueIndex = 0;

/*
 * Quita un articulo del carrito dado su id
 * */
Aplicacion.Mostrador.prototype.quitarDelCarrito = function ( id )
{
	if(DEBUG){
		console.log("Removiendo del carrito.");
	}
	
	carrito = Aplicacion.Mostrador.currentInstance.carrito;
	for (var i = carrito.items.length - 1; i >= 0; i--){
		if( carrito.items[i].idUnique == id ){
			carrito.items.splice( i ,1 );
			break;
		}
	}
	Aplicacion.Mostrador.currentInstance.refrescarMostrador();
	
};

/* ********************************************************
	Panel principal del mostrador
******************************************************** */


/**
 * Contiene el panel con la forma del mostrador
 */
Aplicacion.Mostrador.prototype.mostradorPanel = null;

/**
 * Pone un panel en mostradorPanel
 */
Aplicacion.Mostrador.prototype.mostradorPanelCreator = function (){
	
	
	var productos = [{
		xtype: 'textfield',
		placeHolder : "Agregar Producto",
		listeners : {
			'focus' : function (){

				kconf = {
					type : 'num',
					submitText : 'Agregar',
					callback : Aplicacion.Mostrador.currentInstance.agregarProducto
				};
				POS.Keyboard.Keyboard( this, kconf );
			}
		}
	},{
		xtype : "button",
		text : "Buscar",
		handler : function(){
			sink.Main.ui.setActiveItem( Aplicacion.Inventario.currentInstance.listaInventarioPanel , 'fade');			
		}
	}];


	var venta = [{
		text: 'Cancelar Venta',
		ui: 'action',
		handler : this.cancelarVenta
	},{
		xtype: 'segmentedbutton',
		id : 'Mostrador-tipoCliente',
		allowDepress: false,
		items: [{
			text: 'Venta a Caja Comun',
			pressed: true,
			handler : this.setCajaComun
		}, {
			text: 'Venta a Cliente',
			handler : this.buscarClienteFormShow,
			badgeText : ""
		}]	  
	},{
		id: 'Mostrador-mostradorVender',
		hidden: true,
		text: 'Vender',
		ui: 'forward',
		handler : this.doVentaPanelShow
	}];


   productos.push({xtype: 'spacer'});

	var dockedItems = [new Ext.Toolbar({
		ui: 'light',
		dock: 'bottom',
		items: productos.concat(venta)
	})];
   
	this.mostradorPanel = new Ext.Panel({

		listeners : {
			"show" : this.refrescarMostrador
		},
		floating: false,
		ui : "dark",
		modal: false,
		cls : "Tabla",
		items : [{
			id: 'MostradorHtmlPanel',				
			html : null
		}],
		
		scroll: 'none',
		dockedItems: dockedItems
	});

};








/* ********************************************************
	Buscar y seleccionar cliente para la venta
******************************************************** */


Aplicacion.Mostrador.prototype.buscarClienteForm = null;

Aplicacion.Mostrador.prototype.clienteSeleccionado = function ( cliente )
{
	
	if(DEBUG){
		console.log("cliente seleccionado", cliente);
	}
	
	this.buscarClienteFormShow();
	
	Ext.getCmp("Mostrador-tipoCliente").getComponent(1).setBadge(cliente.nombre);
	
	Aplicacion.Mostrador.currentInstance.carrito.cliente = cliente;
		
};

Aplicacion.Mostrador.prototype.clientePreferencialSeleccionado = function ( cliente )
{
	
	if(DEBUG){
		console.log("cliente preferencial seleccionado", cliente);
	}
	
	
	Ext.getCmp("Mostrador-tipoCliente").getComponent(1).setBadge(cliente.nombre);
	
	Aplicacion.Mostrador.currentInstance.carrito.cliente = cliente;
		
};

Aplicacion.Mostrador.prototype.setCajaComun = function ()
{


	
	if(Ext.getCmp('Mostrador-tipoCliente').getPressed()){
		Ext.getCmp('Mostrador-tipoCliente').setPressed( Ext.getCmp('Mostrador-tipoCliente').getPressed() );
	}

	Ext.getCmp("Mostrador-tipoCliente").getComponent(1).setBadge( );		
	Ext.getCmp('Mostrador-tipoCliente').setPressed(0);

	Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "contado";
	Aplicacion.Mostrador.currentInstance.carrito.cliente = null;
	
	Aplicacion.Mostrador.currentInstance.restaurarPrecios();
	
};

//se llama cuando se han modificado los valores de los precios de los prcutos y afinal de cuenta no se realiza la venta preferencial
Aplicacion.Mostrador.prototype.restaurarPrecios = function()
{

    if(DEBUG){
        console.log("restaurando precios");
    }

    for( var i = 0; i < Aplicacion.Mostrador.currentInstance.carrito.items.length; i++ )
    {
        precioVenta = ( Aplicacion.Mostrador.currentInstance.carrito.items[i].procesado == "true"  )?Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVenta : Aplicacion.Mostrador.currentInstance.carrito.items[i].precioVentaSinProcesar ;
        Aplicacion.Mostrador.currentInstance.carrito.items[i].precio = precioVenta;
    }

    Aplicacion.Mostrador.currentInstance.refrescarMostrador();

}

Aplicacion.Mostrador.prototype.buscarClienteFormCreator = function ()
{
	

	//cancelar busqueda
	var dockedCancelar = {
		xtype : 'button',		
		text: 'Cancelar',
		handler : function(){


			Aplicacion.Mostrador.currentInstance.setCajaComun();
			Aplicacion.Mostrador.currentInstance.buscarClienteFormShow();
		}
		
	};



	//toolbar
	var dockedItems = {
		xtype: 'toolbar',
		dock: 'bottom',
		items: [ dockedCancelar , { xtype: 'spacer' } ]
	};


	var formBase = {
		autoRender: true,
        listeners:{
            'show':function(){
                //TODO: verificar que esto solo se haga una sola vez
                if( !Aplicacion.Mostrador.currentInstance.buscarClienteForm.getComponent(0).getStore() )
                {
                    Aplicacion.Mostrador.currentInstance.buscarClienteForm.getComponent(0).bindStore(Aplicacion.Clientes.currentInstance.listaDeClientesStore);
                }
            }
        },
		floating: true,
		modal: true,
		centered: true,
		hideOnMaskTap: false,
		height: 585,
		width: 680,
		items: [{
			
			width : '100%',
			height: '100%',
			xtype: 'list',
			store: Aplicacion.Clientes ? Aplicacion.Clientes.currentInstance.listaDeClientesStore : null ,
			itemTpl: '<div class="listaDeClientesCliente"><strong>{nombre}</strong> {rfc}</div>',
			grouped: true,
			indexBar: true,
			listeners : {
				"selectionchange"  : function ( view, nodos, c ){
					
					if(nodos.length > 0){
						Aplicacion.Mostrador.currentInstance.clienteSeleccionado( nodos[0].data );
					}

					//deseleccinar el cliente
					view.deselectAll();
				}
			}
			
		}],
		dockedItems: dockedItems
	};



	if(DEBUG){
		console.log( "creando la forma de buscar clientes" );
	}
	
	
	
	this.buscarClienteForm = new Ext.Panel(formBase);

	//por alguna razon al crearlo dice que es visible, 
	//habra que hacerlo invisible
	this.buscarClienteForm.setVisible(false);


};

Aplicacion.Mostrador.prototype.buscarClienteFormShow = function (  )
{


	if(Aplicacion.Mostrador.currentInstance.buscarClienteForm){

		//invertir la visibilidad de la forma
		Aplicacion.Mostrador.currentInstance.buscarClienteForm.setVisible( !Aplicacion.Mostrador.currentInstance.buscarClienteForm.isVisible() );

	}else{
		Aplicacion.Mostrador.currentInstance.buscarClienteFormCreator();
		Aplicacion.Mostrador.currentInstance.buscarClienteFormShow();
	}

	
};




/* ********************************************************
	Thank You for your bussiness
******************************************************** */
Aplicacion.Mostrador.prototype.finishedPanel = null;

Aplicacion.Mostrador.prototype.finishedPanelShow = function()
{
	//update panel
	this.finishedPanelUpdater();
	
	//resetear los formularios
	this.cancelarVenta();
	
	sink.Main.ui.setActiveItem( Aplicacion.Mostrador.currentInstance.finishedPanel , 'fade');
	
};



Aplicacion.Mostrador.prototype.finishedPanelUpdater = function()
{
	carrito = Aplicacion.Mostrador.currentInstance.carrito;
	//incluye los datos de la sucursal
	carrito.sucursal = Aplicacion.Mostrador.currentInstance.infoSucursal;
	                                
	/*indica que se quiere imprimir un ticket, ya que existen 3 casos de impresion
		1.- solo ticket
		2.- solo factura
		3.- ambos
	*/
	
	carrito.ticket = true;

	if(DEBUG){
		console.log("carrito : ", carrito);	
	}

	json = encodeURI( Ext.util.JSON.encode( carrito ) );
	
	do 
	{
		json = json.replace('#','%23');
	} 
	while(json.indexOf('#') >= 0);
	
	html = "";
	
	html += "<table class='Mostrador-ThankYou'>";
	html += "	<tr>";	
	html += "		<td><img src='../media/Receipt128.png'></td>";
	html += "		<td></td>";
	html += "	</tr>"; 
	
	if(carrito.tipo_venta != "credito"){
		//mostrar el cambio
		html += "	<tr>";	
		html += "		<td>Su cambio: <b>"+POS.currencyFormat( parseFloat( Ext.getCmp("Mostrador-doNuevaVentaImporte").getValue() ) - parseFloat( carrito.total ) )+"</b></td>";
		html += "		<td></td>";
		html += "	</tr>";
	}	

	html += "</table>";
	
	if( carrito.factura )
	{
	    html += "<iframe id = 'frame' src ='../impresora/pdf.php?json=" + json + "' width='0px' height='0px'></iframe> ";
	    window.open("../impresora/pdf.php?json=" + json);
	}
	else
	{
	    html += "<iframe src ='PRINTER/src/impresion.php?json=" + json + "' width='0px' height='0px'></iframe> ";
	}
	
	
	this.finishedPanel.update(html);
	
	
	
    Ext.getCmp("Mostrador-mostradorVender").hide( Ext.anims.slide );

	action = "sink.Main.ui.setActiveItem( Aplicacion.Mostrador.currentInstance.mostradorPanel , 'fade');";
	setTimeout(action, 4000);

};

Aplicacion.Mostrador.prototype.finishedPanelCreator = function()
{

	this.finishedPanel = new Ext.Panel({
		html : ""
	});
	
};







/* ********************************************************
	Hacer la venta
******************************************************** */

Aplicacion.Mostrador.prototype.doVenta = function ()
{
	
	carrito = Aplicacion.Mostrador.currentInstance.carrito;

	if(carrito.tipo_venta == 'contado'){
	
		if(DEBUG){
			console.log("revisando venta a contado...");
		}
		
		//ver si pago lo suficiente
		pagado = Ext.getCmp("Mostrador-doNuevaVentaImporte").getValue(); 
		
		if( (pagado.length === 0) || (parseFloat(pagado) < parseFloat(carrito.total)) ){
			
			//no pago lo suficiente
			Ext.Msg.alert("Mostrador", "Verifique al cantidad del importe.");
			
			return;
		}
		
		this.carrito.pagado = pagado;
		this.vender();

		
	}else{
		
		if(DEBUG){
			console.log("revisando venta a credito...");
		}
		//ver si si puede comprar a credito
		//aunque se supone que si debe poder

		this.vender();
		
	}

};

Aplicacion.Mostrador.prototype.vender = function ()
{

    /**
    
      *     {
      *             "id_cliente": int | null,
      *             "tipo_venta": "contado" | "credito",
      *             "tipo_pago": "tarjeta" | "cheque" | "efectivo",
      *             "factura": false | true,
      *             "items": [
      *                 {
      *                     "id_producto": int,
      *                     "procesado": true | false,
      *                     "precio":float,
      *                     "cantidad": float
      *                 }
      *             ]
      *     }
        */


	json = Ext.util.JSON.encode( Aplicacion.Mostrador.currentInstance.carrito );
	
	if(DEBUG){
		console.log("Enviando venta ....");
	}
	
	Ext.Ajax.request({
		url: '../proxy.php',
		scope : this,
		params : {
			action : 100,
			payload : json
		},
		success: function(response, opts) {
			try{
				venta = Ext.util.JSON.decode( response.responseText );				
			}catch(e){
				return POS.error(response, e);
			}
			
			if( !venta.success ){
				//volver a intentar
				if(DEBUG){
					console.log("resultado de la venta sin exito ",venta );
				}
				Ext.Msg.alert("Mostrador", venta.reason);
				return;

			}
			
			if(DEBUG){
				console.log("resultado de la venta exitosa ", venta );
			}
			
			carrito = Aplicacion.Mostrador.currentInstance.carrito;
			
			//verificamos si se hiso una venta preferencial			
			if(  carrito.cliente != null &&  carrito.venta_preferencial.cliente != null &&
                carrito.cliente.id_cliente == carrito.venta_preferencial.cliente.id_cliente )
            {		                
                
                //hacemos una jaxaso para modificar la autorizacion de venta preferencial e indicarle que ya se hiso la venta preferencial                
                Aplicacion.Autorizaciones.currentInstance.finalizarAutorizacionVentaPreferencial();
                                
            }
						
			//almacenamos en el carrito el id de la venta
			Aplicacion.Mostrador.currentInstance.carrito.id_venta = venta.id_venta;
			
			//almacenamos en el carrito el nombre del empleado
			Aplicacion.Mostrador.currentInstance.carrito.empleado = venta.empleado;
			
			
			//recargar el inventario
			Aplicacion.Inventario.currentInstance.cargarInventario();
			
			
			//recargar la lista de clientes y de compras
			if( Aplicacion.Mostrador.currentInstance.carrito.cliente !== null){
				Aplicacion.Clientes.currentInstance.listaDeClientesLoad();
				Aplicacion.Clientes.currentInstance.listaDeComprasLoad();
			}

			//mostrar el panel final
			Aplicacion.Mostrador.currentInstance.finishedPanelShow();
			
			//reseteamos el carrito
			Aplicacion.Mostrador.currentInstance.cancelarVenta();
			
			

		},
		failure: function( response ){
			POS.error( response );
		}
	});
};



/* ********************************************************
	Seleccion de Pago y Vender
******************************************************** */

/*
 * Guarda el panel donde estan la forma de venta
 **/
Aplicacion.Mostrador.prototype.doVentaPanel = null;
Aplicacion.Mostrador.prototype.doNuevaVentaPanel = null;

/*
 * Es la funcion de entrada para mostrar el panel de venta
 **/
Aplicacion.Mostrador.prototype.doVentaPanelShow = function ( ){

	//hacer un update de la nueva informacion en el panel
	Aplicacion.Mostrador.currentInstance.doNuevaVentaPanelUpdater();
	
	//hacer un setcard manual
	sink.Main.ui.setActiveItem( Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel , 'slide');
	
};




/**
    Esta funcion se llama cuando el usuario presioan el boton de tipo de venta Efectivo o Credito
    dependiendo de la seleccion se ocultan los botones de Efectivo o Cheque, si es que selecciono Credito
    ademas se construye la estructura del formulario de la venta(subtotal, total, cambio etc)
*/
Aplicacion.Mostrador.prototype.setTipoVenta = function ( tipo_venta ){


    if( tipo_venta == "contado" ){
        //inicializamos valores
        Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "contado";    
  		Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(1, Ext.anims.slide);           
    }

    if( tipo_venta == "credito" ){
        //inicializamos valores
        Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "credito";
        
        //ocultamos el boton de factura
        Ext.getCmp('Mostrador-doNuevaVentaFacturar').setVisible(false);
        
       
        //establecemos nulo el tipo de pago
        Aplicacion.Mostrador.currentInstance.carrito.tipo_pago = null;  
        
        Ext.getCmp('Mostrador-doNuevaVentaClienteCredito').show( Ext.anims.slide );
        Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').show( Ext.anims.slide );
  		Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(3, Ext.anims.slide);
    }
    


};



Aplicacion.Mostrador.prototype.setTipoPago = function( tipoPago ){

    switch( tipoPago ){
	
        case 'efectivo':
            Aplicacion.Mostrador.currentInstance.carrito.tipo_pago = "efectivo";

             //verificamos si es un cliente para mostrar el boton de factura
            if( Aplicacion.Mostrador.currentInstance.carrito.cliente != null ){
                Ext.getCmp('Mostrador-doNuevaVentaFacturar').setVisible(true);
            }
            
            //fijamo el importe en ceros
            Ext.getCmp('Mostrador-doNuevaVentaImporte').setValue( "" );

			//mostrar la tarjeta de ingresar el dinero
       		Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(2, Ext.anims.slide);
        break; 
        
        case 'cheque':
            Aplicacion.Mostrador.currentInstance.carrito.tipo_pago = "cheque";

            //verificamos si es un cliente para mostrar el boton de factura
            if( Aplicacion.Mostrador.currentInstance.carrito.cliente != null ){
                Ext.getCmp('Mostrador-doNuevaVentaFacturar').setVisible(true);
            }
            
            //fijamos el importe igual al total
             Ext.getCmp('Mostrador-doNuevaVentaImporte').setValue( POS.currencyFormat( this.carrito.total ) );
            
        break; 
        
        default:
            Aplicacion.Mostrador.currentInstance.carrito.tipo_pago = null;
            Ext.Msg.alert("Mostraror","Error, porfavor intente de nuevo.");
    }
    
};



/**
* Actualiza el panel de la venta, mostrando u ocultando los campos que se requieran
*/
Aplicacion.Mostrador.prototype.doNuevaVentaPanelUpdater = function ()
{

    if(DEBUG){
		console.log("Haciendo update en el formulario de la venta", this.carrito);
	}

    //ocultar el formulario de Importe
    Ext.getCmp('Mostrador-doNuevaVentaImporte').setValue("");

    //ocultamos los datos de  cliente
    Ext.getCmp('Mostrador-doNuevaVentaCliente').setValue( "Caja comun" );
		
    Ext.getCmp('Mostrador-doNuevaVentaClienteCredito' ).setVisible(false);
    Ext.getCmp('Mostrador-doNuevaVentaClienteCredito').setValue( "" ); 
		
    Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').setVisible(false); 
    Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').setValue( "" );
	    
    Ext.getCmp('Mostrador-doNuevaVentaDescuento' ).setVisible(false);
    Ext.getCmp('Mostrador-doNuevaVentaDescuento').setValue( "" );			
		
    //ocultamos el boton de factura
    if( Ext.getCmp('Mostrador-doNuevaVentaFacturar').rendered ){
        Ext.getCmp('Mostrador-doNuevaVentaFacturar').reset();
    }
    
    Ext.getCmp('Mostrador-doNuevaVentaFacturar').setVisible(false);

	//mostrar los totales
	subtotal = 0;
	total = 0;
	for (var i=0; i < this.carrito.items.length; i++) {
		subtotal += (this.carrito.items[i].precio * this.carrito.items[i].cantidad);
	}
	
	if( this.carrito.cliente === null ){
		
		//mandamos la
		//Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(1, Ext.anims.slide);        
		
		//si es caja comun
		total = subtotal;
		
		Aplicacion.Mostrador.currentInstance.carrito.factura = false;
		
		//establecemos en elcarrito el tipod e venta contado
		Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "contado";

		//hacemos visible el panel 2 que es el de tipo de pago
		if( Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).rendered )
    		Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(1);

	}else{
		
		//es un cliente
		Ext.getCmp('Mostrador-doNuevaVentaCliente').setValue( this.carrito.cliente.nombre + "  " + this.carrito.cliente.rfc );
		
        //verificamos si el cliente tiene asignado un limite de credito
		if(this.carrito.cliente.limite_credito > 0){
		
		    //mostramos el credito restante
		    //Ext.getCmp('Mostrador-doNuevaVentaClienteCredito' ).setVisible(true);
		    Ext.getCmp('Mostrador-doNuevaVentaClienteCredito').setValue( POS.currencyFormat(this.carrito.cliente.limite_credito) );
			//Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').setVisible(true);
			Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').setValue( POS.currencyFormat( this.carrito.cliente.credito_restante ));			
			
		    }else{
		        //ocultamos el limite de credito
			    Ext.getCmp('Mostrador-doNuevaVentaClienteCreditoRestante').setVisible(false);			
			
			    //establecemos el tipo de venta manualmente a contado ya que no tiene la posibilidad de pagar a credito
			    Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "contado";
		    }

		//hacemos visible la tarjeta 0 que es el tipo de compra
		if(Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).rendered)
		Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1).setActiveItem(0);        
	
		//verificamos si este cliente tiene asignado un descuento
		if( this.carrito.cliente.descuento > 0 ){
			Ext.getCmp('Mostrador-doNuevaVentaDescuento' ).setVisible(true);
			Ext.getCmp('Mostrador-doNuevaVentaDescuento').setValue( POS.currencyFormat( subtotal * (this.carrito.cliente.descuento / 100)) + " ( " + this.carrito.cliente.descuento+"% )" );			
		}else{
			Ext.getCmp('Mostrador-doNuevaVentaDescuento' ).setVisible(false);			
		}

		total = subtotal - ( subtotal * (this.carrito.cliente.descuento / 100));

        //verificamos que tipos de venta se le aplican
		if( total <= this.carrito.cliente.credito_restante){
			//si puede comprar a credito
		}else{
		    //establecemos el tipo de venta manualmente a contado ya que no tiene la posibilidad de pagar a credito
			Aplicacion.Mostrador.currentInstance.carrito.tipo_venta = "contado";
			
		}
		
	}//if cliente

	// alanboy = Aplicacion.Mostrador.currentInstance.doNuevaVentaPanel.getComponent(1);
	Ext.getCmp('Mostrador-doNuevaVentaSubTotal' ).setValue( POS.currencyFormat( subtotal ) );
	Ext.getCmp('Mostrador-doNuevaVentaTotal' ).setValue( POS.currencyFormat( total ) );    

	this.carrito.subtotal = subtotal;
	this.carrito.total = total;
};






/**
  * Se llama para crear por primera vez el nuevo panel de venta
  **/
Aplicacion.Mostrador.prototype.doNuevaVentaPanelCreator = function (	 ){
	
	//cancelar busqueda
	dockedCancelar = {
		xtype : 'button',		
		text: 'Regresar',
		ui :'back',
		handler : function(){
			sink.Main.ui.setActiveItem( Aplicacion.Mostrador.currentInstance.mostradorPanel , 'slide');
		}
	};




	//hacer la venta
	dockedVender = {
		xtype : 'button',
		text: 'Vender',
		ui :'confirm',
		handler : function (){
			Aplicacion.Mostrador.currentInstance.doVenta();
		} 
	};


	//toolbar
	dockedItems = {
		xtype: 'toolbar',
		dock: 'bottom',
		items: [ dockedCancelar , { xtype: 'spacer' } ]
	};
	
	
	this.doNuevaVentaPanel = new Ext.Panel({
	    cls: 'cards',
		dockedItems : dockedItems,	
	    layout: {
	        type: 'vbox',
	        align: 'stretch'
	    },
	    defaults: {
	        flex: 1
	    },
	    items: [
		/** ************************ **
		 **		Carrusel de arriba
		 ** ************************ **/
			{
				xtype: 'fieldset',
				bodyPadding: 10,
				id:'Mostrador-doNuevaVentaForm',
				items: [
					new Ext.form.Text({ label : 'Cliente',			 id: 'Mostrador-doNuevaVentaCliente' }),
					new Ext.form.Text({ label : 'Limite de Credito', id: 'Mostrador-doNuevaVentaClienteCredito', hidden : true }),
					new Ext.form.Text({ label : 'Credito restante',	 id: 'Mostrador-doNuevaVentaClienteCreditoRestante', hidden : true }),
	                new Ext.form.Toggle({ 
						listeners : {
							"change" : function ( a, b, newVal, oldVal ){
								Aplicacion.Mostrador.currentInstance.carrito.factura = newVal == 1;
							}
						},
						id : 'Mostrador-doNuevaVentaFacturar', 
						label : 'Facturar' 
					}),
					new Ext.form.Text({ label : 'Subtotal',			id: 'Mostrador-doNuevaVentaSubTotal' }),
					new Ext.form.Text({ label : 'Descuento',		id: 'Mostrador-doNuevaVentaDescuento' }),
					new Ext.form.Text({ label : 'Total',			id: 'Mostrador-doNuevaVentaTotal' })
				] 
			
	    }, {
			/** ************************ **
			 **		Carrusel de abajo
			 ** ************************ **/
	        xtype: 'carousel',
	        direction: 'vertical',
	        listeners : {
	            "afterrender" : function (){
	                console.log( "show" , this);
	                
	                if(Aplicacion.Mostrador.currentInstance.carrito.tipo_venta == "contado"){
	                  //  this.setActiveItem(1);
	                }else{
	                   //this.setActiveItem(0);
	                }
	            }
	        },
	        items: [
				/** ************************ **
				 **		Primera tarjeta, CONTADO/CREDITO
				 ** ************************ **/
				{		    
				    layout:'hbox',
				    style:{
				        width:'100%',
				        marginLeft: '25%'
				    },
				    items:[{
			            id:'Mostrador-doNuevaVenta-Menu-Contado',
	                    style:{
	                        width:'190px !important',
	                        height:'100px !important'
	                    },
			            html:'<img onClick="Aplicacion.Mostrador.currentInstance.setTipoVenta(\'contado\')" src="../media/venta_contado.png"  />'
								+ '<br>Venta a contado'
			        },
			        {
			            id:'Mostrador-doNuevaVenta-Menu-Credito',
	                    style:{
	                        width:'190px !important',
	                        height:'100px !important',
							marginLeft: '100px'	
	                    },
			            html:'<img onClick="Aplicacion.Mostrador.currentInstance.setTipoVenta(\'credito\')" src="../media/venta_credito.png"  />'
								+ '<br>Venta a credito'
			        }]
	        	},
				/** ************************ **
				 **		Segunda tarjeta EFECTIVO/CHEQUE
				 ** ************************ **/
				{		    
				    layout:'hbox',
				    style:{
				        width:'100%',
				        marginLeft: '25%'
				    },
				    items:[{
				            id:'Mostrador-doNuevaVenta-Menu-Efectivo',
		                    style:{
		                        width:'190px !important',
		                        height:'100px !important'
		                    },
				            html:'<img  onClick="Aplicacion.Mostrador.currentInstance.setTipoPago(\'efectivo\')" src="../media/pago_efectivo.png"  />'
									+ '<br>Efectivo'
				        },
				        {
				            id:'Mostrador-doNuevaVenta-Menu-Cheque',
		                    style:{
		                        width:'190px !important',
		                        height:'100px !important',
								marginLeft: '100px'
		                    },
				            html:'<img  onClick="Aplicacion.Mostrador.currentInstance.setTipoPago(\'cheque\')" src="../media/pago_cheque.png"  />'
								+ '<br>Cheque'
				        }]
	        	},

				/** ************************ **
				 **		Tercera tarjeta, ASKS FOR DA MONEY !
				 ** ************************ **/		
		        {
					id : "Mostrador-doNuevaVentaCobrar",
					xtype: 'fieldset',
					bodyPadding: 20,					
					items: [
						new Ext.form.Text({ 
							label : 'Importe', 
							id: 'Mostrador-doNuevaVentaImporte',
							listeners : {
								"focus" : function (){
									kconf = {
										type : 'num',
										submitText : 'Cobrar',
										callback : function ( campo ){
											Aplicacion.Mostrador.currentInstance.doVenta();
										}
									};

									POS.Keyboard.Keyboard( this, kconf );								
								}
							}
							})
					]
				},
				/** ************************ **
				 **		TERMINAN TARJETAS DE ABAJO
				 ** ************************ **/
				{
					xtype: 'fieldset',
					bodyPadding: 20,					
					items:[new Ext.Button({ 
                        ui  : 'action', 
                        text: 'Vender', 
                        handler: function(){
                            Aplicacion.Mostrador.currentInstance.doVenta();
                        }
                    }) ]
			
				}
				// *** terminan las tarjetas *** //
				]
	    }]
	});
};






POS.Apps.push( new Aplicacion.Mostrador() );
