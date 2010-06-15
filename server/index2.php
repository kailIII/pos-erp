﻿<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

<title>PRUEBAS CON GRID COTIZACION</title>
<link rel="stylesheet" type="text/css" href="../www/ext3/resources/css/ext-all.css"/>
<script type="text/javascript" src="../www/ext3/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="../www/ext3/ext-all-debug.js"></script>
<script type="text/javascript" src="pos/RowEditor.js"></script>
<style>
.milton-icon {
background: url(milton-head-icon.png) no-repeat;
}
.player{
			width: 480px;
			height: 380px;
		}
	
 		body {
			font: normal 16px/22px "Helvetica Neue", Helvetica, Arial, sans-serif; 

			text-align: left;	
			background-color: #2B547E;
			text-shadow:0 0 0 #747170;

		}
		
		div.box{
			width: 80%;
			border:1px solid gray;
			margin: 10;
			padding: 10 10 10 10;
			text-align: left;
			background-color: #ffffff;	
		}
		div.grafica{
			margin: 10;
			padding: 10 10 10 10;
		}
		.bordes { border: 1px solid gray;} 
		pre{
			font-size: 10px;
			color: black;
		}
</style>

<script type="text/javascript"> 
Ext.onReady(function(){
		
	var cotizaciones=  new Ext.data.JsonStore({
		url: 'pos/funcionesCotizacion.php?action=list',
		root: 'datos',
		fields: [{name:'id_cotizacion',type: 'string'},{name:'id_cliente',type: 'string'},{name: 'fecha',type: 'string'},{name: 'subtotal', type: 'string'},{name: 'iva',type: 'string'},{name:'total',type:'string'}]
	});//Datos desde la BD con respuesta del servidor php para el Grid
	cotizaciones.load();



	var detalleCotizacion=  new Ext.data.JsonStore({
		url: 'pos/funcionesCotizacion.php?action=showCotizacion&idCot=&idClien=',
		root: 'datos',
		autoLoad: true,
		fields: [{name:'id_cotizacion',type: 'string'},{name:'id_producto',type: 'string'},{name: 'cantidad',type: 'string'},{name: 'precio', type: 'string'}]
	});//Datos desde la BD con respuesta del servidor php para el Grid
	
	
	var clientes=  new Ext.data.JsonStore({
			url: 'pos/funcionesCliente.php?action=list',
			root: 'datos',
			fields: [{name:'id_cliente',type: 'string'},{name:'nombre',type: 'string'}]
	});
	
	var combo= new Ext.form.ComboBox({
		fielLabel: 'Combo',
		mode: 'remote',
		triggerAction: 'all',
		lazyRender:true,
		typeAhead: true,
		title: 'CLIENTES',
		store: clientes, //origen de datos (lista)
		displayField: 'nombre', //como el DisplayMember de c#
		valueField:'id_cliente', //como el valueMember en c#
		name: 'combo'
	 });
	
	
	//GRID
	var gridCotizaciones = new Ext.grid.GridPanel({// Ext.grid.GridPanel
		renderTo: 'gridCotizaciones',
		frame:true,
		title: 'LISTA DE COTIZACIONES',
		height:300,
		width:860,
		stripeRows: true,
		store: cotizaciones,//origen de datos
		columns: [
				{header: 'ID COTIZACION', dataIndex: 'id_cotizacion', sortable: true,align:'center'}, 
				{header: "ID CLIENTE", dataIndex: 'id_cliente',sortable: true,align:'center'},
				{header: "FECHA", dataIndex: 'fecha',sortable: true, align:'center'},
				{header: "SUBTOTAL", dataIndex:'subtotal',sortable: true,align:'center'},
				{header: "IVA", dataIndex: 'iva',sortable:true,align:'center'},
				{header: "TOTAL", dataIndex: 'total',sortable:true,align:'center'}
				],
		listeners: {
			click: function(e){

						var celda = gridCotizaciones.getSelectionModel().getSelected();
						//console.log(gridCotizaciones.getSelectionModel());
						//return ;
						var idCot=celda.data.id_cotizacion;
						var idClien = celda.data.id_cliente;
						Ext.Ajax.request({ //peticion al servidor 'AJAXSazo'
						url: 'pos/funcionesCotizacion.php?action=showCotizacion', //script
						success: function(result) //propiedad que regresa el script php (JSON flag)
						{
							var data = Ext.util.JSON.decode( result.responseText ); //se guarda en esta variable local data la decodificacion JSON q regresa el servidor php
				
							if ( data.success ){ //data es la variable local JS y success es la propiedad que devuelve el JSON desde PHP
									var detalleCotizacion=  new Ext.data.JsonStore({
									url: 'pos/funcionesCotizacion.php?action=showCotizacion&idCot='+idCot+'&idClien='+idClien,
									root: 'datos',
									fields: [{name:'id_cotizacion',type: 'string'},{name:'id_producto',type: 'string'},{name: 'cantidad',type: 'string'},{name: 'precio', type: 'string'}]
								});//Datos desde la BD con respuesta del servidor php para el Grid
								detalleCotizacion.load();	
								
								gridDetalleCotizacion.reconfigure(detalleCotizacion,gridDetalleCotizacion.getColumnModel());

							}else{
								var detalleCotizacion=  new Ext.data.JsonStore({
									url: 'pos/funcionesCotizacion.php?action=showCotizacion&idCot='+idCot+'&idClien='+idClien,
									root: 'datos',
									fields: [{name:'id_cotizacion',type: 'string'},{name:'id_producto',type: 'string'},{name: 'cantidad',type: 'string'},{name: 'precio', type: 'string'}]
								});//Datos desde la BD con respuesta del servidor php para el Grid
								detalleCotizacion.load();									
								gridDetalleCotizacion.reconfigure(detalleCotizacion,gridDetalleCotizacion.getColumnModel());
							}
						},
						failure: function()
						{
							Ext.Msg.alert("ERROR!!!","ERROR");
						},
						params: { //parametros que se pasaran por el metodo post al script php
							idClien: idClien, //nombre del parametro= id, valor = variable local idW
							idCot:idCot
						}
					}); //AJAX REQUEST
			}//after edit
		},//listener
		tbar: [
			{
			text: 'ELIMINAR COTIZACION',
			handler: function(e) {
				var celda = grid.getSelectionModel().getSelectedCell();
				try{
				var record=cotizaciones.getAt(celda[0]);
				}catch(err) {Ext.Msg.alert("ERROR","ELIJA UNA COTIZACION PARA BORRAR");}
				if(record != null){ //que esté seleccionada una celda
				Ext.Msg.alert("CELDA: "+celda,"ID: "+record.data.id_cotizacion);
					Ext.Msg.show({
					title: 'ELIMINAR COTIZACION',
					buttons: Ext.MessageBox.YESNOCANCEL,
					msg: '¿ELIMINAR '+record.data.id_cotizacion+'?',
					fn: function(btn){
							if (btn == 'yes'){
								var conn = new Ext.data.Connection();
								conn.request({
									url: 'pos/funcionesCotizacion.php',
									params: {
									action: 'delete',
									idClien: record.data.id_cliente
									},
									success: function(resp,opt) {
										cotizaciones.remove(record);
									},
									failure: function(resp,opt) {
										Ext.Msg.alert('Error','NO SE PUDO ELIMINAR COTIZACION');
									}
								});//request
							}//if btn
					}//fn btn
					});//ext.msg.show
				}//fin if record != null
				else{
					Ext.Msg.alert("ERROR","ELIJA UNA COTIZACION PARA BORRAR");
				}
			}//handler
		},//FIN BTN ELIMINAR
		{//INICIO BTN AGREGAR PERSONA
		text: 'AGREGAR COTIZACION',
		handler: function(btn, ev) {
				
				var win= new Ext.Window({
					id: 'win',
					name: 'win',
					width: 250,
					title: 'NUEVA COTIZACION',
					closeAction: 'hide',
					animCollapse: true,
					shadow: 'drop',
					shadowOffset: 9,
					shim:false,
					constraintHeader:true,
					items: [combo],
					buttons:[{
							 text:'AGREGAR',
							 handler: function(){
								 	if(combo.getValue() !=''){
										var conn = new Ext.data.Connection();
										conn.request({
											url: 'pos/funcionesCotizacion.php',
											params: {
											action: 'insert',
											idClien: combo.getValue()
											},
											success: function(resp,opt) {
												cotizaciones.load();
												win.close();
											},
											failure: function(resp,opt) {
												Ext.Msg.alert('Error','NO SE PUDO ELIMINAR COTIZACION');
											}
										});//request
									}
								 }
							 }
							 ]
				});
				win.show(this);
				Ext.get('win').setOpacity(.85);
    			}//function handler
		}//FIN BTN AGREGAR PERSONA
		]//fin toolbar
	});//FIN GRID
	
	
	
	var gridDetalleCotizacion = new Ext.grid.EditorGridPanel({// Ext.grid.GridPanel
		renderTo: 'gridDetalleCotizacion',
		frame:true,
		title: 'DETALLE COTIZACION',
		height:300,
		width:860,
		stripeRows: true,
		store: detalleCotizacion,//origen de datos
		columns: [
				{header: 'ID COTIZACION', dataIndex: 'id_cotizacion', sortable: true,align:'center'}, 
				{header: "ID PRODUCTO", dataIndex: 'id_producto',sortable: true,align:'center'},
				{header: "CANTIDAD", dataIndex: 'cantidad',sortable: true, align:'center'},
				{header: "PRECIO", dataIndex:'precio',sortable: true,align:'center'}
				],
		listeners: {
			click: function(e){
				
//
//						var celda2 = gridDetalleCotizacion.getSelectionModel().getSelected();
//						//console.log(gridCotizaciones.getSelectionModel());
//						//return ;
//						var idDetCot=celda2.data.id_cotizacion;
//						var idProd = celda2.data.id_producto;
//						Ext.Ajax.request({ //peticion al servidor 'AJAXSazo'
//						url: 'pos/funcionesCotizacion.php?action=showCotizacion', //script
//						success: function(result) //propiedad que regresa el script php (JSON flag)
//						{
//							var data = Ext.util.JSON.decode( result.responseText ); //se guarda en esta variable local data la decodificacion JSON q regresa el servidor php
//				
//							if ( data.success ){ //data es la variable local JS y success es la propiedad que devuelve el JSON desde PHP
//									var detalleCotizacion=  new Ext.data.JsonStore({
//									url: 'pos/funcionesCotizacion.php?action=showCotizacion&idCot='+idCot+'&idClien='+idClien,
//									root: 'datos',
//									fields: [{name:'id_cotizacion',type: 'string'},{name:'id_producto',type: 'string'},{name: 'cantidad',type: 'string'},{name: 'precio', type: 'string'}]
//								});//Datos desde la BD con respuesta del servidor php para el Grid
//								detalleCotizacion.load();							
//							}
//						},
//						failure: function()
//						{
//							Ext.Msg.alert("ERROR!!!","ERROR");
//						},
//						params: { //parametros que se pasaran por el metodo post al script php
//							idClien: idClien, //nombre del parametro= id, valor = variable local idW
//							idCot:idCot
//						}
//					}); //AJAX REQUEST
			}//after edit
		},//listener
		tbar: [
			{
			text: 'ELIMINAR PRODUCTO',
			handler: function(e) {
				var celda = grid.getSelectionModel().getSelectedCell();
				try{
				var record=cotizaciones.getAt(celda[0]);
				}catch(err) {Ext.Msg.alert("ERROR","ELIJA UN PRODUCTO PARA BORRAR");}
				if(record != null){ //que esté seleccionada una celda
				Ext.Msg.alert("CELDA: "+celda,"ID: "+record.data.id_cotizacion);
					Ext.Msg.show({
					title: 'ELIMINAR PRODUCTO',
					buttons: Ext.MessageBox.YESNOCANCEL,
					msg: '¿ELIMINAR '+record.data.id_cotizacion+'?',
					fn: function(btn){
							if (btn == 'yes'){
								var conn = new Ext.data.Connection();
								conn.request({
									url: 'pos/funcionesCotizacion.php',
									params: {
									action: 'delete',
									idClien: record.data.id_cliente
									},
									success: function(resp,opt) {
										cotizaciones.remove(record);
									},
									failure: function(resp,opt) {
										Ext.Msg.alert('Error','NO SE PUDO ELIMINAR PRODUCTO');
									}
								});//request
							}//if btn
					}//fn btn
					});//ext.msg.show
				}//fin if record != null
				else{
					Ext.Msg.alert("ERROR","ELIJA UN PRODUCTO PARA BORRAR");
				}
			}//handler
		},//FIN BTN ELIMINAR
		{//INICIO BTN AGREGAR PERSONA
		text: 'AGREGAR PRODUCTO',
		handler: function(btn, ev) {
				
				var win= new Ext.Window({
					id: 'win',
					name: 'win',
					width: 250,
					title: 'ELEGIR PRODUCTO',
					closeAction: 'hide',
					animCollapse: true,
					shadow: 'drop',
					shadowOffset: 9,
					shim:false,
					constraintHeader:true,
					items: [combo],
					buttons:[{
							 text:'AGREGAR',
							 handler: function(){
								 	if(combo.getValue() !=''){
										var conn = new Ext.data.Connection();
										conn.request({
											url: 'pos/funcionesCotizacion.php',
											params: {
											action: 'insert',
											idClien: combo.getValue()
											},
											success: function(resp,opt) {
												cotizaciones.load();
												win.close();
											},
											failure: function(resp,opt) {
												Ext.Msg.alert('Error','NO SE PUDO ELIMINAR PRODUCTO');
											}
										});//request
									}
								 }
							 }
							 ]
				});
				win.show(this);
				Ext.get('win').setOpacity(.85);
    			}//function handler
		}//FIN BTN AGREGAR PERSONA
		]//fin toolbar
	});//FIN GRIDDETALLE
	
	
});//fin onready

</script>

</head>

<body>
<div align="center">
	<div class="box">
	<div><h1>COTIZACIONES</h1></div>
	<div id="gridCotizaciones" align="center"></div>
	<br />
    <div id="gridDetalleCotizacion" align="center"></div>
    </div>
</div>
</body>
</html>