import java.net.*;
import java.io.*;
import java.util.*;

public class SupervisoraDeConexao extends Thread {
    private Parceiro usuario;
    private Socket conexao;
    private ArrayList<Parceiro> usuarios;
    private ChatbotRegras chatbot;

    public SupervisoraDeConexao(Socket conexao, ArrayList<Parceiro> usuarios, ChatbotRegras chatbot) throws Exception {
        if (conexao == null) throw new Exception("Conexao ausente");
        if (usuarios == null) throw new Exception("Usuarios ausentes");
        if (chatbot == null) throw new Exception("Chatbot ausente");

        this.conexao = conexao;
        this.usuarios = usuarios;
        this.chatbot = chatbot;
    }

    public void run() {
        ObjectOutputStream transmissor;
        try {
            transmissor = new ObjectOutputStream(this.conexao.getOutputStream());
        } catch (Exception erro) {
            return;
        }

        ObjectInputStream receptor = null;
        try {
            receptor = new ObjectInputStream(this.conexao.getInputStream());
        } catch (Exception err0) {
            try { transmissor.close(); } catch (Exception falha) {}
            return;
        }

        try {
            this.usuario = new Parceiro(this.conexao, receptor, transmissor);
        } catch (Exception e) {}

        try {
            synchronized (this.usuarios) {
                this.usuarios.add(this.usuario);
            }

            // Envia menu inicial
            this.usuario.receba(new RespostaDeChatbot(chatbot.montarMenu()));

            for (;;) {
                Comunicado comunicado = this.usuario.envie();

                if (comunicado == null) return;

                else if (comunicado instanceof PedidoDePergunta) {
                    PedidoDePergunta pedido = (PedidoDePergunta) comunicado;
                    int opcao = pedido.getOpcao();

                    if (opcao == 0) {
                        // usuario pediu sair
                        synchronized (this.usuarios) {
                            this.usuarios.remove(this.usuario);
                        }
                        this.usuario.receba(new RespostaDeChatbot("👋 Até mais! Obrigado por usar o GetGreen!"));
                        this.usuario.adeus();
                        return;
                    } else {
                        String resp = chatbot.responder(opcao);
                        this.usuario.receba(new RespostaDeChatbot(resp));
                        // reenvia menu para facilitar novo pedido
                        this.usuario.receba(new RespostaDeChatbot("\nEscolha outra opção ou digite 0 para sair:\n" + chatbot.montarMenu()));
                    }
                } else if (comunicado instanceof PedidoParaSair) {
                    synchronized (this.usuarios) {
                        this.usuarios.remove(this.usuario);
                    }
                    this.usuario.adeus();
                    return;
                } else {
                    // mensagens desconhecidas - ignora
                }
            }
        } catch (Exception erro) {
            try {
                // tenta fechar streams
                // (Parceiro.adeus já fecha)
                if (this.usuario != null) this.usuario.adeus();
            } catch (Exception falha) {}
            return;
        }
    }
}
