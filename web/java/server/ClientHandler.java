package server;

import java.net.Socket;

// Classe que trata a comunicação com um cliente
public class ClientHandler extends Thread {
    private Partner partner;
    private String clientName;
    private ChatServer server;

    public ClientHandler(Socket socket, ChatServer server) throws Exception {
        this.partner = new Partner(socket);
        this.server = server;
    }

    @Override
    public void run() {
        try {
            // Solicita o nome do cliente
            partner.send(new ChatMessage("Servidor", "Digite seu nome:"));
            ChatMessage firstMessage = (ChatMessage) partner.receive();
            this.clientName = firstMessage.getSender();

            // Notifica todos os usuários da entrada de um novo cliente
            server.broadcast(new ChatMessage("Servidor", clientName + " entrou no chat."));

            // Loop principal de recebimento de mensagens
            while (true) {
                Message message = partner.receive();

                if (message instanceof ChatMessage chatMsg) {
                    // Se o cliente digitar /exit, encerra a conexão
                    if (chatMsg.getContent().equalsIgnoreCase("/exit")) {
                        server.broadcast(new ChatMessage("Servidor", clientName + " saiu do chat."));
                        break;
                    }
                    // Envia a mensagem para todos os outros clientes
                    server.broadcast(new ChatMessage(clientName, chatMsg.getContent()));
                }
            }
        } catch (Exception e) {
            System.out.println("Conexão com o cliente perdida: " + e.getMessage());
        } finally {
            server.removeClient(this);
        }
    }

    // Envia uma mensagem para o cliente
    public void send(ChatMessage message) {
        try {
            partner.send(message);
        } catch (Exception e) {
            System.out.println("Erro ao enviar mensagem para " + clientName);
        }
    }
}
