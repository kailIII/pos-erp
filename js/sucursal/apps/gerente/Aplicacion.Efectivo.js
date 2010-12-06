

Aplicacion.Efectivo = function (  ){

	return this._init();
}




Aplicacion.Efectivo.prototype._init = function (){
    if(DEBUG){
		console.log("Efectivo: construyendo");
    }

	
	//crear el panel de nuevo gasto
	this.nuevoGastoPanelCreator();
	
	//crear el panel de nuevo ingreso
	this.nuevoIngresoPanelCreator();
	
	//crear el panel de operacion intersucursal efectivo
	this.operacionInterSucursalEfectivoPanelCreator();

    //crear el panel de operacion intersucursal producto
    this.operacionIntersucursalProductoPanelCreator();
	
	
	Aplicacion.Efectivo.currentInstance = this;
	
	return this;
};




Aplicacion.Efectivo.prototype.getConfig = function (){
    return {
        text: 'Efectivo',
        cls: 'launchscreen',
        items: [{
            text: 'Gastos',
            card: this.nuevoGastoPanel,
            leaf: true
        },
        {
            text: 'Ingresos',
            card: this.nuevoIngresoPanel,
            leaf: true
        },
        {
            text: 'Operaciones entre Sucursales',
            //card: this.operacionesInterSucursalesPanel,
            items: [{
                text: 'Efectivo',
                card: this.operacionInterSucursalEfectivoPanel,
                leaf: true
            },
            {
                text: 'Producto',
                card: this.operacionInterSucursalProductoPanel,
                leaf: true
            }]
        }]
    };
};



/* ********************************************************
	Operacion Inter Sucursales
******************************************************** */



/**
 * Contiene un panel con la forma de una operacion intersucursal de efectivo
 */
Aplicacion.Efectivo.prototype.operacionInterSucursalEfectivoPanel = null;



/**
 * Pone un panel en operacionInterSucursalEfectivoPanel
 */
Aplicacion.Efectivo.prototype.operacionInterSucursalEfectivoPanelCreator = function (){

    var menu = [{
        xtype : "spacer"
    },{
        id : "Efectivo-PrestamoEfectivo",
        text: 'Nuevo Prestamo',
        ui: 'forward',
        hidden : false

    }];




    var dockedItems = [new Ext.Toolbar({
        ui: 'light',
        dock: 'bottom',
        items: menu
    })];
    
    this.operacionInterSucursalEfectivoPanel = new Ext.form.FormPanel({                                                       
        dockedItems: dockedItems,
            items: [{

                xtype: 'fieldset',
                title: 'Nuevo prestamo de efectivo',
                instructions: 'Todos los campos son necesarios para una nueva autorizacion.',
                defaults : {
                    listeners : {
                        "change" : function (){
                            Aplicacion.Efectivo.currentInstance.nuevoGastoValidator();
                        }
                    }
                },
                items: [
                    {
                        xtype : "selectfield",
                        label : "Sucursal",
                        name : "sucursal",
                        options : [
                            {
                                text : "Sucursal 1",
                                value : "Sucursal 1"
                            },{
                                text : "Sucursal 2",
                                value : "Sucursal 2"
                            },{
                                text : "Sucursal 3",
                                value : "Sucursal 3"
                            },{
                                text : "Sucursal 4",
                                value : "Sucursal 4"
                            }
                        ]
                    },{
                        xtype : "selectfield",
                        label : "Responsable",
                        name : "responsable",
                        options : [
                            {
                                text : "Juan",
                                value : "Sucursal 1"
                            },{
                                text : "Pedro",
                                value : "Sucursal 2"
                            },{
                                text : "Pablo",
                                value : "Sucursal 3"
                            },{
                                text : "Omar",
                                value : "Sucursal 4"
                            }
                        ]
                    },{
                        xtype : "textfield",
                        label : "Monto",
                        name : "monto",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'num',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoGastoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                    },{
                        xtype : "textfield",
                        label : "Nota",
                        name : "nota",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'alfa',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoGastoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                    }
                ]}
        ]});

}



/**
 * Contiene un panel con la forma de una operacion intersucursal de producto
 */
Aplicacion.Efectivo.prototype.operacionInterSucursalProductoPanel = null;



/**
 * Pone un panel en operacionInterSucursalProductoPanel
 */
Aplicacion.Efectivo.prototype.operacionIntersucursalProductoPanelCreator = function (){

    var menu = [{
        xtype : "spacer"
    },{
        id : "Efectivo-PrestamoEfectivo",
        text: 'Crear Gasto',
        ui: 'forward',
        hidden : false

    }];




    var dockedItems = [new Ext.Toolbar({
        ui: 'light',
        dock: 'bottom',
        items: menu
    })];
    
    this.operacionInterSucursalProductoPanel = new Ext.form.FormPanel({                                                       
        dockedItems: dockedItems,
            items: [{

                xtype: 'fieldset',
                title: 'Nueva venta de producto',
                instructions: 'Todos los campos son necesarios para una nueva autorizacion.',
                defaults : {
                    listeners : {
                        "change" : function (){
                            Aplicacion.Efectivo.currentInstance.nuevoGastoValidator();
                        }
                    }
                },
                items: [
                    {
                        xtype : "textfield",
                        label : "Monto",
                        name : "monto",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'num',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoGastoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                        
                    },{
                        xtype : "textfield",
                        label : "Folio",
                        name : "folio",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'alfa',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoGastoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }

                    },{
                        xtype : "datepickerfield",
                        label : "Fecha",
                        picker : { yearFrom : 2010 },
                        name : "fecha"
                    },{
                        xtype : "selectfield",
                        label : "Concepto",
                        name : "concepto",
                        options : [
                            {
                                text : "Luz",
                                value : "luz"
                            },{
                                text : "Predial",
                                value : "predial"
                            },{
                                text : "Sueldo",
                                value : "sueldo"
                            },{
                                text : "Otro",
                                value : "otro"
                            }
                        ]
                    },{
                        xtype : "textfield",
                        label : "Nota",
                        name : "nota",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'alfa',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoGastoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                    }
                ]}
        ]});

}








/**
 * Contiene el panel con la forma de nuevo gasto
 */
Aplicacion.Efectivo.prototype.operacionesInterSucursalesPanel = null;


/**
 * Pone un panel en nuevoGastoPanel
 */
Aplicacion.Efectivo.prototype.operacionesInterSucursalesPanelCreator = function (){
	this.operacionesInterSucursalesPanel = new Ext.form.FormPanel({                                                       

			items: [{
				xtype: 'fieldset',
			    title: 'Nueva autorizacion',
			    instructions: 'Todos los campos son necesarios para una nueva autorizacion.',
				items: [
					new Ext.form.Text({
					    id: 'nombreClienteM',
					    label: 'Nombre'
					}),
					new Ext.form.Text({
					    id: 'rfcClienteM',
					    label: 'RFC'
					}),
					new Ext.form.Text({
					    id: 'direccionClienteM',
					    label: 'Direccion'
					}),
					new Ext.form.Text({
					    label: 'Ciudad'
					}),
					new Ext.form.Text({
					    id: 'emailClienteM',
					    label: 'E-mail'
					}),
					new Ext.form.Text({
					    id: 'telefonoClienteM',
					    label: 'Telefono'
					}),
					new Ext.form.Text({
					    id: 'descuentoClienteM',
					    label: 'Descuento'
					}),
					new Ext.form.Text({
					    id: 'limite_creditoClienteM',
					    label: 'Lim. Credito'
					})
				]}
		]});
};








/* ********************************************************
	Nuevo Gasto
******************************************************** */


/**
 * Validar los datos de la forma de nuevo gasto
 */
Aplicacion.Efectivo.prototype.nuevoGastoValidator = function ()
{
	//obtener los valores de la forma
	var values = Aplicacion.Efectivo.currentInstance.nuevoGastoPanel.getValues();
	
	if( isNaN(values.monto) || values.monto.length == 0 ){

        Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-monto' ), 
            'fade', {duration: 250,
            out: true,
            autoClear: true
        });

		return;
	}
	
    if( Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).isVisible() )
    {
        if(  values.folio.length == 0 )
        {
            Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ), 
                'fade', {duration: 250,
                out: true,
                autoClear: true
            });

            return;
        }
    }

    if( !values.fecha )
    {
        Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-fecha' ), 
            'fade', {duration: 250,
            out: true,
            autoClear: true
        });

        return;
    }

    Aplicacion.Efectivo.currentInstance.nuevoGasto( values );

};


/**
 * Inserta el nuevo gasto en la BD
 */
Aplicacion.Efectivo.prototype.nuevoGasto = function( data ){

    Ext.getBody().mask('Guardando nuevo gasto ...', 'x-mask-loading', true);

    Ext.Ajax.request({
        url: 'proxy.php',
        scope : this,
        params : {
            action : 600,
            data : Ext.util.JSON.encode( data )
        },
        success: function(response, opts) {
            try{
                r = Ext.util.JSON.decode( response.responseText );
            }catch(e){
                POS.error(e);
            }

            Ext.getBody().unmask(); 

            //limpiar la forma      
            Aplicacion.Efectivo.currentInstance.nuevoGastoPanel.reset();

            //si no esta visible el campo de folio lo regresamos
            if( !Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).isVisible() )
            {
                Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).show();
                Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ), 
                'slide', 
                {
                    duration: 500,
                    out: false,
                    autoClear: false,
                });
            }

            //informamos que todo salio bien
            Ext.Msg.alert("Efectivo","Se ha registrado el nuevo gasto"); 

        },
        failure: function( response ){
            POS.error( response );
        }
    }); 

};


/**
 * Contiene el panel con la forma de nuevo gasto
 */
Aplicacion.Efectivo.prototype.nuevoGastoPanel = null;


/**
 * Pone un panel en nuevoGastoPanel
 */
Aplicacion.Efectivo.prototype.nuevoGastoPanelCreator = function (){

	this.nuevoGastoPanel = new Ext.form.FormPanel({
        items: [{
                xtype: 'fieldset',
                title: 'Ingrese los detalles del nuevo gasto',
                instructions: 'Si desea agregar un gasto que no se encuentre en la lista debera pedir una autorizacion.',
                items: [
                    new Ext.form.Text({ id:'Efectivo-nuevoGastoPanel-monto', name: 'monto', label: 'Monto' }),
                    new Ext.form.Text({ id:'Efectivo-nuevoGastoPanel-folio', name: 'folio', label: 'Folio' }),
                    new Ext.form.DatePicker({ id:'Efectivo-nuevoGastoPanel-fecha', name : 'fecha', label: 'Fecha', picker : { yearFrom : 2010, yearTo : 2011 } }),
                    new Ext.form.Select({ 
                        id:'Efectivo-nuevoGastoPanel-concepto',
                        name : 'concepto',
                        label: 'Concepto',
                        options : [
                            {
                                text : "Luz",
                                value : "luz"
                            },{
                                text : "Agua",
                                value : "agua"
                            },{
                                text : "Telefono",
                                value : "telefono"
                            },{
                                text : "Nextel",
                                value : "nextel"
                            },{
                                text : "Comida",
                                value : "comida"
                            }
                        ],
                        listeners : {
                            "change" : function (){

                                if(this.value == "comida")
                                {
                                    Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ), 
                                    'slide', 
                                    {
                                        duration: 500,
                                        out: true,
                                        autoClear: false,
                                        after : function (){ 
                                            Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).setValue("");
                                            Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).hide()
                                        }
                                    });
                                }
                                else if( !Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).isVisible() )
                                {
                                    Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ).show();
                                    Ext.Anim.run(Ext.getCmp( 'Efectivo-nuevoGastoPanel-folio' ), 
                                    'slide', 
                                    {
                                        duration: 500,
                                        out: false,
                                        autoClear: false,
                                    });
                                }

                            }
                        }
                    }),
                    new Ext.form.Text({ id:'Efectivo-nuevoGastoPanel-nota', name : 'nota', label: 'Nota' }),
                ]},
                new Ext.Button({ id : 'Efectivo-NuevoGasto', ui  : 'action', text: 'Registrar Gasto', margin : 5,  handler : this.nuevoGastoValidator, disabled : false }),
        ]
    });
};





















/* ********************************************************
	Nuevo Ingreso
******************************************************** */


/**
 * Validar los datos de la forma de nuevo ingreso
 */
Aplicacion.Efectivo.prototype.nuevoIngresoValidator = function ()
{
    //obtener los valores de la forma
    var values = Aplicacion.Efectivo.currentInstance.nuevoIngresoPanel.getValues();
    
    if( isNaN(values.monto) || values.monto.length == 0 ){
        console.log("no ok");       
        return;
    }
    
    console.log("ok");
    
    /*
    
    Ext.Anim.run( Ext.getCmp("Efectivo-CrearGasto"), "fade", { duration: 250, out: false, autoClear : false , after : function (){ }});
    
    
    Ext.Anim.run( Ext.getCmp("Efectivo-CrearGasto"), "fade", { duration: 250, out: false, autoClear : false }); //in
    Ext.Anim.run( Ext.getCmp("Efectivo-CrearGasto"), "fade", { duration: 250, out: true, autoClear : false }); //out
    */
};



/*
 * Guarda el panel donde estan la forma de nuevo cliente
 **/
Aplicacion.Efectivo.prototype.nuevoIngresoPanel = null;






/*
 * Se llama para crear por primera vez el panel de nuevo cliente
 **/
Aplicacion.Efectivo.prototype.nuevoIngresoPanelCreator = function (  ){

    if(DEBUG){ console.log ("creando panel de historial de autorizaciones"); }

     var menu = [{
        xtype : "spacer"
    },{
        id : "Efectivo-CrearIngreso",
        text: 'Crear Ingreso',
        ui: 'forward',
        hidden : false

    }];




    var dockedItems = [new Ext.Toolbar({
        ui: 'light',
        dock: 'bottom',
        items: menu
    })];
    
    this.nuevoIngresoPanel = new Ext.form.FormPanel({                                                       
        dockedItems: dockedItems,
            items: [{

                xtype: 'fieldset',
                title: 'Nuevo Ingreso',
                instructions: 'Todos los campos son necesarios para registrar un nuevo ingreso.',
                defaults : {
                    listeners : {
                        "change" : function (){
                            Aplicacion.Efectivo.currentInstance.nuevoIngresoValidator();
                        }
                    }
                },
                items: [
                    {
                        xtype : "textfield",
                        label : "Monto",
                        name : "monto",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'num',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoIngresoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                        
                    },{
                        xtype : "datepickerfield",
                        label : "Fecha",
                        picker : { yearFrom : 2010 },
                        name : "fecha"
                    },{
                        
                        xtype : "textfield",
                        label : "Concepto",
                        name : "concepto",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'num',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoIngresoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                    },{
                        xtype : "textfield",
                        label : "Nota",
                        name : "nota",
                        listeners : {
                            'focus' : function (){

                                kconf = {
                                    type : 'alfa',
                                    submitText : 'Aceptar',
                                    callback : Aplicacion.Efectivo.currentInstance.nuevoIngresoValidator
                                };
                                POS.Keyboard.Keyboard( this, kconf );
                            }
                        }
                    }
                ]}
        ]});

};

















POS.Apps.push( new Aplicacion.Efectivo() );






