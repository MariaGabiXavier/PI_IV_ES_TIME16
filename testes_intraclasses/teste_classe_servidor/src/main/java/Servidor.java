
import java.util.*;

public class Servidor {
    public static String PORTA_PADRAO = "3000";

    public static void main(String[] args) {
        if (args.length > 1) {
            System.err.println("Uso esperado: java Servidor [PORTA]\n");
            return;
        }

        String porta = Servidor.PORTA_PADRAO;
        if (args.length == 1) porta = args[0];

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        AceitadoraDeConexao aceitadora = null;
        try {
            aceitadora = new AceitadoraDeConexao(porta, usuarios, chatbot);
            aceitadora.start();
        } catch (Exception erro) {
            System.err.println("Escolha uma porta apropriada e liberada para uso!\n");
            return;
        }

        for (;;) {
            System.out.println("O servidor está ativo! Para desativá-lo, use o comando \"desativar\"\n");
            System.out.print("> ");

            String comando = null;
            try {
                comando = Teclado.getUmString();
            } catch (Exception e) {}

            if (comando != null && comando.toLowerCase().equals("desativar")) {
                synchronized (usuarios) {
                    ComunicadoDeDesligamento cd = new ComunicadoDeDesligamento();
                    for (Parceiro usuario : usuarios) {
                        try {
                            usuario.receba(cd);
                            usuario.adeus();
                        } catch (Exception erro) {}
                    }
                }
                System.out.println("O servidor foi desativado!\n");
                System.exit(0);
            } else {
                System.err.println("Comando inválido!\n");
            }
        }
    }
    public static void executarComando(String comando,
                                       ArrayList<Parceiro> usuarios,
                                       ChatbotRegras chatbot) {

        if (comando != null && comando.toLowerCase().equals("desativar")) {
            synchronized (usuarios) {
                ComunicadoDeDesligamento cd = new ComunicadoDeDesligamento();
                for (Parceiro usuario : usuarios) {
                    try {
                        usuario.receba(cd);
                        usuario.adeus();
                    } catch (Exception erro) {}
                }
            }
        } else {
            throw new IllegalArgumentException("Comando inválido");
        }
    }

}
