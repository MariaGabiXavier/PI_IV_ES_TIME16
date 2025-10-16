package client;

import javax.swing.*;
import java.awt.*;
import java.awt.event.*;

// Interface gráfica simples do chat (janela/modal)
public class ChatWindow extends JFrame {
    private JTextArea chatArea;
    private JTextField messageField;
    private JButton sendButton;

    private Partner partner;
    private String userName;

    public ChatWindow(Partner partner, String userName) {
        this.partner = partner;
        this.userName = userName;

        setTitle("Chat - " + userName);
        setSize(400, 500);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // Área de mensagens
        chatArea = new JTextArea();
        chatArea.setEditable(false);
        chatArea.setLineWrap(true);
        chatArea.setWrapStyleWord(true);
        add(new JScrollPane(chatArea), BorderLayout.CENTER);

        // Campo de digitação
        JPanel bottomPanel = new JPanel(new BorderLayout());
        messageField = new JTextField();
        sendButton = new JButton("Enviar");
        bottomPanel.add(messageField, BorderLayout.CENTER);
        bottomPanel.add(sendButton, BorderLayout.EAST);
        add(bottomPanel, BorderLayout.SOUTH);

        // Ação do botão "Enviar"
        sendButton.addActionListener(e -> sendMessage());
        messageField.addActionListener(e -> sendMessage());

        // Thread para receber mensagens do servidor
        new Thread(() -> {
            try {
                while (true) {
                    Message msg = partner.receive();
                    if (msg instanceof ChatMessage chatMsg) {
                        chatArea.append(chatMsg + "\n");
                    }
                }
            } catch (Exception ex) {
                chatArea.append("⚠️ Conexão encerrada.\n");
            }
        }).start();

        setVisible(true);
    }

    // Envia mensagem digitada
    private void sendMessage() {
        try {
            String content = messageField.getText().trim();
            if (!content.isEmpty()) {
                partner.send(new ChatMessage(userName, content));
                messageField.setText("");
            }
        } catch (Exception e) {
            chatArea.append("❌ Erro ao enviar mensagem.\n");
        }
    }
}
