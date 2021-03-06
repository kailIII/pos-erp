
Aplicacion.Salir = function (  ){

	return this._init();
}




Aplicacion.Salir.prototype._init = function (){
    if(DEBUG){
		console.log("app Salir: construyendo");
    }

	Aplicacion.Salir.currentInstance = this;
	
	return this;
};




Aplicacion.Salir.prototype.getConfig = function (){
	return {
	    text: 'Salir',
	    cls: 'launchscreen',
		leaf : true,
		card : new Ext.Panel({
		    layout: {
		        type: 'vbox',
		        pack: 'center',
		        align: 'stretch'
		    },
		    defaults: {
		        xtype: 'button',
		        cls: 'demobtn'
		    },
		    items: [{
		        text: 'Salir del punto de venta',
		        handler: function() {
						Ext.Ajax.request({
							url: 'proxy.php',
							scope : this,
							params : {
								action : 2002
							},
							success: function(response, opts) {
								window.location = ".";
							},
							failure: function( response ){
								POS.error( response );
							}
						});
		        }
		    }]
		})
	};
};




POS.Apps.push( new Aplicacion.Salir() );






