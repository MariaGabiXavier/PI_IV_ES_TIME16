package cliente;

import servidor.*;
import java.net.*;

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

    final Parceiro servidor; 

    final String ANSI_RESET = "\u001B[0m";
    final String ANSI_CYAN = "\u001B[36m";
    final String ANSI_GREEN = "\u001B[32m";
    final String ANSI_YELLOW = "\u001B[33m";

        try {
            servidor = new Parceiro(conexao);
        } catch (Exception erro) {
            System.err.println("Falha ao estabelecer comunicacao com o servidor:\n" + erro.getMessage());
            return;
        }

        try {
            Comunicado inicial = servidor.envie();
            if (inicial instanceof RespostaDeChatbot) {
                String texto = ((RespostaDeChatbot) inicial).getResposta();
                printMenu(texto, ANSI_CYAN, ANSI_RESET);
            }

            TratadoraDeComunicadoDeDesligamento tratadora =
                new TratadoraDeComunicadoDeDesligamento(servidor);
            tratadora.start();
        } catch (Exception e) {
            
        }

        // Thread para ler respostas do servidor
        Thread leitor = new Thread(() -> {
            try {
                for (;;) {
                    // consume the next comunicado
                    Comunicado c = (Comunicado) servidor.envie();
                    if (c instanceof RespostaDeChatbot) {
                        RespostaDeChatbot r = (RespostaDeChatbot) c;
                        String texto = r.getResposta();
                        if (isMenu(texto)) {
                            // servidor enviou o menu — printar como menu
                            printMenu(texto, ANSI_CYAN, ANSI_RESET);
                        } else {
                            // formatar resposta bonitinho
                            System.out.println();
                            System.out.println(ANSI_GREEN + "--- Resposta do Chatbot ---" + ANSI_RESET);
                            System.out.println(texto);
                            System.out.println(ANSI_GREEN + "---------------------------\n" + ANSI_RESET);
                        }
                    } else if (c instanceof ComunicadoDeDesligamento) {
                        System.out.println("Servidor vai desligar.");
                        System.exit(0);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
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
                    servidor.receba(new PedidoParaSair());
                    System.out.println("Encerrando cliente. Obrigado!");
                    System.exit(0);
                }
                Thread.sleep(200);
            }
        } catch (Exception e) {
            System.out.println("Erro de comunicação; encerre e tente novamente.");
            System.exit(0);
        }
    }

    private static boolean isMenu(String texto) {
        if (texto == null) return false;
        String lower = texto.toLowerCase();
        return lower.contains("bem-vindo") || lower.contains("escolha uma") || lower.contains("0 - sair");
    }

    private static void printMenu(String texto, String color, String reset) {
        if (texto == null) return;
        String[] linhas = texto.split("\\n");
        System.out.println();
        System.out.println(color + "====== Menu do Chatbot ======" + reset);
        for (String l : linhas) {
            System.out.println(l);
        }
        System.out.println(color + "=============================" + reset + "\n");
    }
}
