package servidor;
import java.net.*;
import java.util.*;

public class AceitadoraDeConexao extends Thread {
    private ServerSocket pedido;
    private ArrayList<Parceiro> usuarios;
    private ChatbotRegras chatbot;

    public AceitadoraDeConexao(String porta, ArrayList<Parceiro> usuarios, ChatbotRegras chatbot) throws Exception {
        if (porta == null) throw new Exception("Porta ausente");
        try {
            this.pedido = new ServerSocket(Integer.parseInt(porta));
        } catch (Exception erro) {
            throw new Exception("Porta invalida");
        }
        if (usuarios == null) throw new Exception("Usuarios ausentes");
        this.usuarios = usuarios;
        this.chatbot = chatbot;
    }

    public void run() {
        for (;;) {
            Socket conexao = null;
            try {
                conexao = this.pedido.accept();
            } catch (Exception erro) {
                continue;
            }

            SupervisoraDeConexao supervisora = null;
            try {
                supervisora = new SupervisoraDeConexao(conexao, usuarios, chatbot);
            } catch (Exception e) {}
            supervisora.start();
        }
    }
}
