package client;

import javax.swing.*;
import java.net.Socket;

// Cliente principal do chat
public class ChatClient {
    public static void main(String[] args) {
        try {
            String host = JOptionPane.showInputDialog("Endereço do servidor:", "localhost");
            int port = Integer.parseInt(JOptionPane.showInputDialog("Porta:", "12345"));
            String userName = JOptionPane.showInputDialog("Digite seu nome:");

            // Conecta ao servidor
            Socket connection = new Socket(host, port);
            Partner partner = new Partner(connection);

            // Envia o nome do usuário ao servidor
            partner.send(new ChatMessage(userName, userName + " entrou no chat!"));

            // Abre a janela do chat
            SwingUtilities.invokeLater(() -> new ChatWindow(partner, userName));

        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, "Não foi possível conectar ao servidor.", "Erro", JOptionPane.ERROR_MESSAGE);
        }
    }
}
