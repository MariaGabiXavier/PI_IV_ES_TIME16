import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;

//Sustituto de classe teclado

class Teclado {
    public static String getUmString() {
        return null; // nunca será usado nos testes
    }
}

//substitutos das classes que suas instancias são atributos de servidor
class Comunicado {}
class ComunicadoDeDesligamento extends Comunicado {}

class Parceiro {
    public void receba(Comunicado c) throws Exception {}
    public void adeus() throws Exception {}
}

class ParceiroFake extends Parceiro {
    public boolean recebeu = false;
    public boolean saiu = false;

    @Override
    public void receba(Comunicado c) {
        if (c instanceof ComunicadoDeDesligamento)
            recebeu = true;
    }

    @Override
    public void adeus() {
        saiu = true;
    }
}

class ChatbotRegras {}

class AceitadoraDeConexao extends Thread {
    public boolean iniciou = false;

    public AceitadoraDeConexao(String porta, ArrayList<Parceiro> usuarios, ChatbotRegras chatbot) {}

    @Override
    public void run() {
        iniciou = true;
    }
}

// ------------ TESTES REAIS DO SERVIDOR ------------ //

public class ServidorTest {

    // teste de servidor rodando em porta padrão
    @Test
    public void teste1() {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        AceitadoraDeConexao aceitar =
                new AceitadoraDeConexao(Servidor.PORTA_PADRAO, usuarios, chatbot);

        aceitar.start();
        try { Thread.sleep(50); } catch (Exception e) {}

        assertTrue(aceitar.iniciou);
    }
    //teste do porta fornecida pelo string args[]
    @Test
    public void teste2() {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        String porta = "4000";

        AceitadoraDeConexao aceitar =
                new AceitadoraDeConexao(porta, usuarios, chatbot);

        aceitar.start();
        try { Thread.sleep(50); } catch (Exception e) {}

        assertTrue(aceitar.iniciou);
    }
    // teste de desligamento do servidor
    @Test
    public void teste3() {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        // adiciona 1 usuário fake
        ParceiroFake pf = new ParceiroFake();
        usuarios.add(pf);

        Servidor.executarComando("desativar", usuarios, chatbot);

        assertTrue(pf.recebeu);
        assertTrue(pf.saiu);
    }
    //teste de comando inválido
    @Test
    public void teste4() {
        ArrayList<Parceiro> usuarios = new ArrayList<>();
        ChatbotRegras chatbot = new ChatbotRegras();

        assertThrows(IllegalArgumentException.class, () ->
                Servidor.executarComando("abc123", usuarios, chatbot)
        );
    }
}

