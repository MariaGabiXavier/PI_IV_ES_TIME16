package server;

import java.io.*;
import java.net.Socket;

// Classe responsável por gerenciar a comunicação com um cliente conectado
public class Partner {
    private Socket connection;
    private ObjectOutputStream out;
    private ObjectInputStream in;

    public Partner(Socket connection) throws Exception {
        if (connection == null)
            throw new Exception("Conexão ausente");

        this.connection = connection;
        this.out = new ObjectOutputStream(connection.getOutputStream());
        this.in = new ObjectInputStream(connection.getInputStream());
    }

    // Envia uma mensagem ao cliente
    public void send(Message message) throws Exception {
        this.out.writeObject(message);
        this.out.flush();
    }

    // Recebe uma mensagem do cliente
    public Message receive() throws Exception {
        return (Message) this.in.readObject();
    }

    // Fecha a comunicação com o cliente
    public void close() throws Exception {
        this.in.close();
        this.out.close();
        this.connection.close();
    }
}
