package servidor;
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
        // construct Parceiro which will open DataInput/Output streams directly
        try {
            this.usuario = new Parceiro(this.conexao);
        } catch (Exception e) {
            e.printStackTrace();
            return;
        }

        try {
            synchronized (this.usuarios) {
                this.usuarios.add(this.usuario);
            }

            System.out.println("Nova conexao: " + this.conexao.getRemoteSocketAddress());

            // Envia menu inicial
            System.out.println("Enviando menu inicial para " + this.conexao.getRemoteSocketAddress());
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
            erro.printStackTrace();
            return;
        }
    }
}
