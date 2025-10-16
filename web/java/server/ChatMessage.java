package server;

// Representa uma mensagem de chat enviada por um usuário
public class ChatMessage extends Message {
    private static final long serialVersionUID = 1L;

    private String sender;   // Nome
    private String content;  // Conteúdo da mensagem

    public ChatMessage(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public String getContent() {
        return content;
    }

    @Override
    public String toString() {
        return sender + ": " + content;
    }
}
