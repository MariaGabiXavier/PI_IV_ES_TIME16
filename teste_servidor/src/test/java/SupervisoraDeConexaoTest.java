import org.junit.jupiter.api.*;
import java.io.*;
import java.net.*;
import java.util.*;

public class SupervisoraDeConexaoTest {

    private ServerSocket servidor;

    @BeforeEach
    void iniciarServidor() throws Exception {
        servidor = new ServerSocket(4000);
    }

    @AfterEach
    void fecharServidor() throws Exception {
        if (!servidor.isClosed()) servidor.close();
    }

    private Socket conectarCliente() throws Exception {
        return new Socket("127.0.0.1", servidor.getLocalPort());
    }

    // simula o menu do chatbot
    private ChatbotRegras criarChatbotFake() {
        return new ChatbotRegras() {
            @Override
            public String montarMenu() {
                return "MENU_FAKE";
            }

            @Override
            public String responder(int opcao) {
                return "RESPOSTA_FAKE";
            }
        };
    }

    //teste completo de run com o servidor com parametros corretos
    @Test
    void teste1() throws Exception {

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras bot = criarChatbotFake();

        // inicia supervisor em thread real
        new Thread(() -> {
            try {
                Socket s = servidor.accept();
                SupervisoraDeConexao sup = new SupervisoraDeConexao(s, usuarios, bot);
                sup.run();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        Socket cliente = conectarCliente();

        DataInputStream in = new DataInputStream(cliente.getInputStream());
        DataOutputStream out = new DataOutputStream(cliente.getOutputStream());

        // recebe RESP|MENU_FAKE
        String recebido = in.readUTF();
        Assertions.assertEquals("RESP|MENU_FAKE", recebido);

        // não travar servidor
        out.writeUTF("SAI|");

        cliente.close();
    }

    // teste com conexão nula
    @Test
    void teste2() {

        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras bot = criarChatbotFake();

        Assertions.assertThrows(Exception.class, () -> {
            new SupervisoraDeConexao(null, usuarios, bot);
        });
    }

    //teste atribuição de usuario ao servidor e recebimento do menu
    @Test
    void teste3() throws Exception {

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

        String inicial = in.readUTF();
        Assertions.assertEquals("RESP|MENU_FAKE", inicial);

        Assertions.assertEquals(1, usuarios.size());

        out.writeUTF("SAI|");

        cliente.close();
    }

    // teste envio de mensagem do usuario e resposta do servidor
    @Test
    void teste4() throws Exception {

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


        in.readUTF();


        out.writeUTF("PED|1");


        String r1 = in.readUTF();
        Assertions.assertEquals("RESP|RESPOSTA_FAKE", r1);


        String r2 = in.readUTF();
        Assertions.assertEquals("RESP|\nEscolha outra opção ou digite 0 para sair:\nMENU_FAKE", r2);

        out.writeUTF("SAI|");

        cliente.close();
    }
}




