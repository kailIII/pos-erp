<?php
	require_once('../../server/misc/mobile_device_detect.php');
	mobile_device_detect(true,false,true,true,true,true,true,'mobile/', false);

?>
<html> 
<head> 
  <title>Papas Supremas | Administracion</title> 
    
    <link rel="stylesheet" type="text/css" href="../getResource.php?mod=admin&type=css" /> 
    
    <link type="text/css" href="../jquery/css/vader/jquery-ui-1.8.2.custom.css" rel="stylesheet" />
    <link type="text/css" href="../jquery/css/ui.jqgrid.css" rel="stylesheet" />
    <link type="text/css" href="../jquery/css/screen.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="../jquery/css/flexigrid/flexigrid.css">
    
    <script src="../jquery/js/init.js"  type="text/javascript"></script> 

    <script type="text/javascript" src="../mochikit/MochiKit.js"></script>
    <script type="text/javascript" src="../plotkit/Base.js"></script>
    <script type="text/javascript" src="../plotkit/Layout.js"></script>
    <script type="text/javascript" src="../plotkit/Canvas.js"></script>
    <script type="text/javascript" src="../plotkit/SweetCanvas.js"></script>
    
    
    
    <script type="text/javascript" src="../jquery/jquery-1.4.2.min.js"></script>
    <script type="text/javascript" src="../jquery/js/jquery-ui-1.8.2.custom.min.js"></script>
    <script type="text/javascript" src="../jquery/js/grid.locale-sp.js"></script>
    <script type="text/javascript" src="../jquery/js/jquery.jqGrid.min.js"></script>
    <script type="text/javascript" src="../jquery/js/flexigrid.js"></script>
    
    <script type="text/javascript" src="../jquery/js/ui.datepicker.js"></script>
    
    <script type="text/javascript" src="../getResource.php?mod=admin&type=js"></script>  
    
</head> 
<body> 
<div id="menu-top">
 		<div id="title-text" style="float:left" class="title">Papas Supremas - Administraci&oacute;n </div>
 		<!-- <div id="logout"><button id="boton-salir">Salir</button></div> -->
 		
 		<div id="top">
 		<a href="#" id="boton-salir"> 
			<span class="left"></span> 
			<span class="right"></span> 
			Salir
		</a>
		</div>
		
 	</div>
 <div id="main">
 	<div id="main-container">
		<div id="menu-left">
		</div>
		<div id="content">
		</div>
		<div style="clear:both;"></div>
 	</div>
 	
 </div>
 <!--
 <div id="footer">
 Caffeina&copy;2010
 </div> -->
</body> 
</html>
