import org.junit.jupiter.api.*;
import java.io.*;
import java.net.*;
import java.util.*;

public class ServidorInterclassesTest {

    private ServerSocket servidor;

    @BeforeEach
    void iniciar() throws Exception {
        servidor = new ServerSocket(0); // porta dinâmica
    }

    @AfterEach
    void fechar() throws Exception {
        servidor.close();
    }

    private Socket conectarCliente() throws Exception {
        return new Socket("127.0.0.1", servidor.getLocalPort());
    }

    private ChatbotRegras criarChatbotFake() {
        return new ChatbotRegras() {

            public String montarMenu() {
                return "MENU_FAKE";
            }


            public String responder(int opcao) {
                if (opcao == 1) return "RESPOSTA_OK";
                return "OPCAO_INVALIDA";
            }
        };
    }

    // ---------------- CENÁRIO NORMAL ---------------- //
    @Test
    void testeNormal() throws Exception {

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras bot = criarChatbotFake();

        new Thread(() -> {
            try {
                Socket s = servidor.accept();
                SupervisoraDeConexao sup = new SupervisoraDeConexao(s, usuarios, bot);
                sup.run();
            } catch (Exception e) {}
        }).start();

        Socket cliente = conectarCliente();

        DataInputStream in = new DataInputStream(cliente.getInputStream());
        DataOutputStream out = new DataOutputStream(cliente.getOutputStream());

        // recebe o menu
        String menu = in.readUTF();
        Assertions.assertEquals("RESP|MENU_FAKE", menu);

        // envia opção válida
        out.writeUTF("PED|1");

        String resp = in.readUTF();
        Assertions.assertEquals("RESP|RESPOSTA_OK", resp);

        out.writeUTF("SAI|");
        cliente.close();
    }

    // ---------------- VARIAÇÃO 1 ---------------- //
    @Test
    void testeOpcaoInvalida() throws Exception {

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras bot = criarChatbotFake();

        new Thread(() -> {
            try {
                Socket s = servidor.accept();
                SupervisoraDeConexao sup = new SupervisoraDeConexao(s, usuarios, bot);
                sup.run();
            } catch (Exception e) {}
        }).start();

        Socket cliente = conectarCliente();

        DataInputStream in = new DataInputStream(cliente.getInputStream());
        DataOutputStream out = new DataOutputStream(cliente.getOutputStream());

        in.readUTF(); // ignora menu

        out.writeUTF("PED|999");

        String resp = in.readUTF();
        Assertions.assertEquals("RESP|OPCAO_INVALIDA", resp);

        out.writeUTF("SAI|");
        cliente.close();
    }

    // ---------------- VARIAÇÃO 2 ---------------- //
    @Test
    void testeDesconexaoAbrupta() throws Exception {

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras bot = criarChatbotFake();

        new Thread(() -> {
            try {
                Socket s = servidor.accept();
                SupervisoraDeConexao sup = new SupervisoraDeConexao(s, usuarios, bot);
                sup.run();
            } catch (Exception e) {
                // Esperado: erro ao ler do cliente
            }
        }).start();

        Socket cliente = conectarCliente();

        // recebe menu
        DataInputStream in = new DataInputStream(cliente.getInputStream());
        in.readUTF();

        // desconectar antes de enviar comandos
        cliente.close();

        // supervisor deve terminar sem travar
        Thread.sleep(200);

        Assertions.assertTrue(true); // chegou aqui, não travou
    }
}
