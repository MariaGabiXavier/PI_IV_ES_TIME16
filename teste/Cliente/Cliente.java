import java.net.*;
import java.io.*;

public class Cliente {
    public static final String HOST_PADRAO = "localhost";
    public static final int PORTA_PADRAO = 3000;

    public static void main(String[] args) {
        if (args.length > 2) {
            System.err.println("Uso esperado: java Cliente [HOST [PORTA]]\n");
            return;
        }

        Socket conexao = null;
        try {
            String host = HOST_PADRAO;
            int porta = PORTA_PADRAO;
            if (args.length > 0) host = args[0];
            if (args.length == 2) porta = Integer.parseInt(args[1]);
            conexao = new Socket(host, porta);
        } catch (Exception erro) {
            System.err.println("Indique o servidor e a porta corretos!\n");
            return;
        }

        ObjectOutputStream transmissor = null;
        try {
            transmissor = new ObjectOutputStream(conexao.getOutputStream());
        } catch (Exception erro) {
            System.err.println("Indique o servidor e a porta corretos!\n");
            return;
        }

        ObjectInputStream receptor = null;
        try {
            receptor = new ObjectInputStream(conexao.getInputStream());
        } catch (Exception erro) {
            System.err.println("Indique o servidor e a porta corretos!\n");
            return;
        }

        Parceiro servidor = null;
        try {
            servidor = new Parceiro(conexao, receptor, transmissor);
        } catch (Exception erro) {
            System.err.println("Indique o servidor e a porta corretos!\n");
            return;
        }

        try {
            TratadoraDeComunicadoDeDesligamento tratadora = new TratadoraDeComunicadoDeDesligamento(servidor);
            tratadora.start();
        } catch (Exception e) {}

        // Thread pra ler respostas do servidor e exibir
        Thread leitor = new Thread(() -> {
            try {
                for (;;) {
                    Comunicado c = (Comunicado) servidor.envie();
                    if (c instanceof RespostaDeChatbot) {
                        RespostaDeChatbot r = (RespostaDeChatbot) c;
                        System.out.println(r.getResposta());
                    } else if (c instanceof ComunicadoDeDesligamento) {
                        System.out.println("Servidor vai desligar.");
                        System.exit(0);
                    }
                }
            } catch (Exception e) {
                System.out.println("Conexão perdida.");
                System.exit(0);
            }
        });
        leitor.start();

        // Loop de interação (usuário escolhe opção)
        try {
            for (;;) {
                System.out.print("\nDigite o número da opção (0 para sair): ");
                int opcao = Teclado.getUmInt();
                servidor.receba(new PedidoDePergunta(opcao));
                if (opcao == 0) {
                    // envia pedido para sair e encerra
                    servidor.receba(new PedidoParaSair());
                    System.out.println("Encerrando cliente. Obrigado!");
                    System.exit(0);
                }
                // a resposta será impressa pela thread leitor
                // aguardamos um pouco para próxima interação (opcional)
                Thread.sleep(200);
            }
        } catch (Exception e) {
            System.out.println("Erro de comunicação; encerre e tente novamente.");
            System.exit(0);
        }
    }
}
