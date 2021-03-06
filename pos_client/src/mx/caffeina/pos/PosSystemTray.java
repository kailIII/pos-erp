package mx.caffeina.pos;

import java.awt.*;
import java.io.*;
import java.net.URL;
import java.awt.event.*;
import java.io.IOException;
import javax.swing.ImageIcon;
import javax.imageio.ImageIO;




public class PosSystemTray
{

    final TrayIcon trayIcon;


	public TrayIcon getTrayIcon()
	{
		return trayIcon ;
	}


    public PosSystemTray()
    {
		
		
        if (!SystemTray.isSupported()) 
		{
            Logger.warn("System tray is currently not supported.");
			trayIcon = null;
			return;
        }

            SystemTray tray = SystemTray.getSystemTray();

			// WORKS with image outside jar
			ImageIcon icono = new ImageIcon("media/logo.png");
			Image image = icono.getImage();


            MouseListener mouseListener = new MouseListener() {
                
                public void mouseClicked(MouseEvent e) {
                    //System.out.println("Tray Icon - Mouse clicked!");                 
                }
                public void mouseEntered(MouseEvent e) {
                    //System.out.println("Tray Icon - Mouse entered!");                 
                }
                public void mouseExited(MouseEvent e) {
                    //System.out.println("Tray Icon - Mouse exited!");                 
                }
                public void mousePressed(MouseEvent e) {
                    //System.out.println("Tray Icon - Mouse pressed!");                 
                }
                public void mouseReleased(MouseEvent e) {
                    //System.out.println("Tray Icon - Mouse released!");                 
                }

            };

            ActionListener exitListener = new ActionListener() {
                public void actionPerformed(ActionEvent e) {
                    
                    System.exit(0);
                }
            };
            
            ActionListener upgradeListener = new ActionListener() {
                public void actionPerformed(ActionEvent e) {

                    PosClientUpgrader.checkForUpdates( );

                    //si no me sali, es porque no habia updates
                    PosClient.trayIcon.getTrayIcon().displayMessage("POS", 
                                "POS esta en la version mas actual",
                                TrayIcon.MessageType.INFO);
                    //System.exit(3);
                }
            };

            PopupMenu popup = new PopupMenu();
            
            
            MenuItem defaultItem = new MenuItem("Cerrar cliente");
            defaultItem.addActionListener(exitListener);
            popup.add( defaultItem );


            MenuItem defaultItem2 = new MenuItem("Actualizar Cliente");
            defaultItem2.addActionListener(upgradeListener);
            popup.add( defaultItem2 );


            trayIcon = new TrayIcon(image, "Pos Client", popup);

            ActionListener actionListener = new ActionListener() {
	
                public void actionPerformed(ActionEvent e) {
                    trayIcon.displayMessage("Pos Client", 
                        "Pos client corriendo !",
                        TrayIcon.MessageType.INFO);
                }
            };
            
            trayIcon.setImageAutoSize(true);
            trayIcon.addActionListener(actionListener);
            trayIcon.addMouseListener(mouseListener);

            //    Depending on which Mustang build you have, you may need to uncomment
            //    out the following code to check for an AWTException when you add 
            //    an image to the system tray.

			try {
			    tray.add(trayIcon);
			} catch (AWTException e) {
			    Logger.error("TrayIcon could not be added.");
			}

        
    }
    
 
    
}
