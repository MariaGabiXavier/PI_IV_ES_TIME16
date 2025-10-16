package server;

import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;

// Servidor principal do chat(main)
public class ChatServer {
    private List<ClientHandler> clients = new ArrayList<>();

    // Inicia o servidor em uma porta específica
    public void start(int port) {
        try (ServerSocket serverSocket = new ServerSocket(port)) {
            System.out.println("Servidor de chat iniciado na porta " + port);

            while (true) {
                // Aguarda novos clientes se conectarem
                Socket clientSocket = serverSocket.accept();
                ClientHandler handler = new ClientHandler(clientSocket, this);
                clients.add(handler);
                handler.start(); // Inicia a thread de atendimento do cliente
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Envia uma mensagem para todos os clientes conectados
    public synchronized void broadcast(ChatMessage message) {
        System.out.println(message);
        for (ClientHandler client : clients) {
            client.send(message);
        }
    }

    // Remove um cliente da lista (quando desconecta)
    public synchronized void removeClient(ClientHandler client) {
        clients.remove(client);
    }

    // Método principal (main)
    public static void main(String[] args) {
        ChatServer server = new ChatServer();
        server.start(12345); // Porta padrão
    }
}
