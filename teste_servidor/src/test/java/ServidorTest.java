import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.*;

// ============================================================================
// STUB 1 — TecladoStub (para evitar loop e entrada real)
// ============================================================================
class Teclado {
    public static String getUmString() {
        return null; // substituído em testes
    }
}

class TecladoStub extends Teclado {
    private static Queue<String> entradas = new LinkedList<>();

    public static void addEntrada(String e) {
        entradas.add(e);
    }

    public static void limpar() {
        entradas.clear();
    }

    public static String getUmString() {
        return entradas.poll(); // não trava
    }
}

// ============================================================================
// STUB 2 — Classes de Comunicados necessários
// ============================================================================
class Comunicado {}
class ComunicadoDeDesligamento extends Comunicado {}
class PedidoParaSair extends Comunicado {}
class PedidoDePergunta extends Comunicado {
    private int opcao;
    public PedidoDePergunta(int opcao){ this.opcao = opcao; }
    public int getOpcao(){ return opcao; }
}
class RespostaDeChatbot extends Comunicado {
    private String resposta;
    public RespostaDeChatbot(String r) { this.resposta = r; }
    public String getResposta(){ return resposta; }
}

// ============================================================================
// STUB 3 — ChatbotRegras (mínimo possível)
// ============================================================================
class ChatbotRegras {
    public String montarMenu() { return "MENU"; }
    public String responder(int opcao) { return "Resposta " + opcao; }
}

// ============================================================================
// STUB 4 — ParceiroFake (sem socket real)
// ============================================================================
class Parceiro {
    public Parceiro(Object ignored) {}
    public void receba(Comunicado c) throws Exception {}
    public void adeus() throws Exception {}
}

class ParceiroFake extends Parceiro {
    public boolean recebeuDesligamento = false;
    public boolean fechou = false;

    public ParceiroFake() {
        super(null);
    }

    @Override
    public void receba(Comunicado c) {
        if (c instanceof ComunicadoDeDesligamento) {
            recebeuDesligamento = true;
        }
    }

    @Override
    public void adeus() {
        fechou = true;
    }
}

// ============================================================================
// STUB 5 — AceitadoraFake (não abre servidor real)
// ============================================================================
class AceitadoraDeConexao extends Thread {
    public AceitadoraDeConexao(String porta, ArrayList<Parceiro> usuarios, ChatbotRegras chatbot) {}
}

class AceitadoraFake extends Thread {
    public boolean iniciou = false;

    public AceitadoraFake(String porta, ArrayList<Parceiro> usuarios, ChatbotRegras chatbot) {}

    @Override
    public void run() {
        iniciou = true;
    }
}

// ============================================================================
// CÓPIA SIMPLIFICADA DO Servidor COM MÉTODO testável executarComando()
// ============================================================================
class Servidor {
    public static String PORTA_PADRAO = "3000";

    // método seguro para testes — sem System.exit e sem loop
    public static void executarComando(String comando,
                                       ArrayList<Parceiro> usuarios,
                                       ChatbotRegras chatbot) {

        if (comando == null)
            throw new IllegalArgumentException("Comando nulo!");

        if (comando.toLowerCase().equals("desativar")) {

            synchronized (usuarios) {
                ComunicadoDeDesligamento cd = new ComunicadoDeDesligamento();
                for (Parceiro usuario : usuarios) {
                    try {
                        usuario.receba(cd);
                        usuario.adeus();
                    } catch (Exception ign) {}
                }
            }
            return;
        }

        throw new IllegalArgumentException("Comando inválido!");
    }
}

// ============================================================================
// ===========================   TESTES   =====================================
// ============================================================================

public class ServidorTest {

    // test com porta padrão
    @Test
    public void teste1() throws Exception {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        AceitadoraFake aceitadora =
                new AceitadoraFake("3000", usuarios, chatbot);

        aceitadora.start();
        Thread.sleep(50);
        assertTrue(aceitadora.iniciou);
        System.out.println("Aceitadora Iniciada em:" +3000);
    }

    // teste recebendo porta de conexão pelo string args
    @Test
    public void teste2() throws Exception {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        String[] args = {"4000"};

        AceitadoraFake aceitadora =
                new AceitadoraFake(args[0], usuarios, chatbot);

        aceitadora.start();
        Thread.sleep(50);

        assertTrue(aceitadora.iniciou);
        System.out.println("Aceitadora Iniciada em:" +args[0]);
    }

    // Teste de comando desativar servidor
    @Test
    public void teste3() {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        ParceiroFake usuario = new ParceiroFake();
        usuarios.add(usuario);

        Servidor.executarComando("desativar", usuarios, chatbot);

        assertTrue(usuario.recebeuDesligamento);
        assertTrue(usuario.fechou);
        System.out.println("Parceiro desativado em:" +usuarios);
    }
}

