<?php

/**
*
*	Controller para la vista view_ingresos
*
*	Contiene funciones que nos generan información relevante para la generación de gráficas de ventas
*	@author Luis Michel <luismichel@caffeina.mx>
*/


require_once("../server/model/view_ingresos.dao.php");


	/**
        *       Obtiene los datos para generar una grafica de los ingresos en general.
        *       Se obtiene un valor x, un valor y, y un label.
        *
        *       @author Luis Michel <luismichel@computer.org>
        *       @static
        *       @access public
	*	@param {String} timeRange El rango de tiempo para formatear el resultado (semana, mes, year)
	*	@param {Integer} id_sucursal (Opcional) El identificador de la sucursal de donde queremos obtener los datos
	*	@param {Date} fechaInicio (Opcional) La fecha de inicio de donde se quieren ver los datos
	*	@param {Date} fechaFinal (Opcional) La fecha final del rango de tiempo de donde se quieren obtener los datos
        *       @return Array un arreglo con los datos obtenidos de la consulta NOTA: Si existe un error regresara un arreglo, donde el primer
	*			elemento del arreglo es FALSE, y el segundo la razon del error
        */


	function DataIngresos( $timeRange, $id_sucursal, $fechaInicio, $fechaFinal )
	{

		$data = ViewIngresosDao::getDataIngresos($timeRange, $id_sucursal, $fechaInicio, $fechaFinal);

		if ( $data[0] != false )
		{
			$result = '{ "success": true, "datos": '.json_encode($data).'}';
		}
		else
		{
			$result = '{ "success": false, "error": '.$data[1].'}';
		}

		return $result;
		
	}


	/**
	*	Obtiene los datos de los ingresos por sucursal
	*
	*	@params <String> timeRange (Opcional) Es un rango de tiempo, puede ser semana, mes o year
	*	@params <String> fechaInicio (Opcional) Fecha de inicio de un rango de tiempo del cual se requiere consultar datos; fechaFinal es obligatorio si se usa fechaInicio
	*	@params <String> fechaFinal (Opcional) Fecha final de un rango de tiempo del cual se requiere consultar datos; Debe de ir junto con fechaInicio
	*	@params <Integer> id_sucursal (Opcional) El id de una sucursal del cual se quieren obtener datos
	*/

	function sucursalIngresos( $timeRange, $fechaInicio, $fechaFinal, $id_sucursal, $showAll )
	{
	
		$data = ViewIngresosDao::ingresosSucursal( $timeRange, $fechaInicio, $fechaFinal, $id_sucursal );

		if ( $data[0] != false )
		{

			if ( $showAll == true )
			{
				$result = '{ "success": true, "datos": '.json_encode($data).'}';
			}
			else
			{
				$result = '{ "success": true, "datos": '.json_encode($data[0]).'}';
			}
		}
		else
		{
			$result = '{ "success": false, "error": "'.$data[1].'"}';
		}

		return $result;
	}
	
	
	

	switch($args['action'])
	{


		/**********VIEW_INGRESOS****************************/

	case '802' : // graficaIngresos
	
		$timeRange = null;
		$fechaInicio = null;
		$fechaFinal = null;
		$id_sucursal = null;


		if ( isset($args['dateRange']) )
		{
			$timeRange = $args['dateRange'];
		}
		

		if ( isset($args['id_sucursal']) )
		{
			$id_sucursal = $args['id_sucursal'];
		}

		if ( isset($args['fecha-inicio']) && isset($args['fecha-final']) )
		{
			$fechaInicio = $args['fecha-inicio'];
			$fechaFinal = $args['fecha-final'];	
		}

		$result = DataIngresos( $timeRange, $id_sucursal, $fechaInicio, $fechaFinal );
		echo $result;
		break;

		
			case '804' : //sucursalIngresos
	
		$timeRange = null;
		$fechaInicio = null;
		$fechaFinal = null;
		$id_sucursal = null;
		$showAll = null;


		if ( isset($args['dateRange']) )
		{
			$timeRange = $args['dateRange'];
		}
		

		if ( isset($args['id_sucursal']) )
		{
			$id_sucursal = $args['id_sucursal'];
		}

		if ( isset($args['fecha-inicio']) && isset($args['fecha-final']) )
		{
			$fechaInicio = $args['fecha-inicio'];
			$fechaFinal = $args['fecha-final'];	
		}

		if ( isset($args['showAll']) )
		{
			$showAll = $args['showAll'];
		}
		
		$result = sucursalIngresos( $timeRange, $fechaInicio, $fechaFinal, $id_sucursal, $showAll );
	
		echo $result;
	break;
		


		
		

	}


?>
