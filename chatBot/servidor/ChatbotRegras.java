package servidor;
import java.util.*;

public class ChatbotRegras {
    private LinkedHashMap<Integer, String> perguntas;
    private HashMap<Integer, String> respostas;

    public ChatbotRegras() {
        perguntas = new LinkedHashMap<>();
        respostas = new HashMap<>();

        perguntas.put(1, "O que é o GetGreen?");
        perguntas.put(2, "Esqueci minha senha, o que faço?");
        perguntas.put(3, "");
        perguntas.put(4, "");
        perguntas.put(5, "Qual a importância da coleta seletiva?");

        respostas.put(1, "O GetGreen é um projeto que incentiva práticas sustentáveis e conscientização ambiental. Para mais informações, visite a pagina sobre o GetGreen.");
        respostas.put(2, "Para mudar sua senha, vá para a página de login e clique em 'Esqueci minha senha'. Siga as instruções enviadas");
        respostas.put(3, "");
        respostas.put(4, "");
        respostas.put(5, "A coleta seletiva é importante porque reduz o desperdício e permite a reciclagem de materiais.");
    }

    public String montarMenu() {
        StringBuilder sb = new StringBuilder();
        sb.append("Bem-vindo ao Chatbot GetGreen!\nEscolha uma das perguntas abaixo:");
        for (Map.Entry<Integer, String> e : perguntas.entrySet()) {
            sb.append("\n").append(e.getKey()).append(" - ").append(e.getValue());
        }
        sb.append("\n0 - Sair");
        return sb.toString();
    }

    public String responder(int opcao) {
        if (respostas.containsKey(opcao)) return respostas.get(opcao);
        return "Opção inválida.";
    }
}
