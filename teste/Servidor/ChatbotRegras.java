package servidor;
import java.util.*;

public class ChatbotRegras {
    private LinkedHashMap<Integer, String> perguntas;
    private HashMap<Integer, String> respostas;

    public ChatbotRegras() {
        perguntas = new LinkedHashMap<>();
        respostas = new HashMap<>();

        perguntas.put(1, "O que é reciclagem?");
        perguntas.put(2, "Como posso ajudar o meio ambiente?");
        perguntas.put(3, "O que é o GetGreen?");
        perguntas.put(4, "Onde posso descartar lixo eletrônico?");
        perguntas.put(5, "Qual a importância da coleta seletiva?");

        respostas.put(1, "♻️ Reciclagem é o processo de transformar materiais usados em novos produtos, reduzindo o desperdício.");
        respostas.put(2, "🌍 Você pode ajudar reduzindo o consumo, reciclando, evitando plástico e economizando energia!");
        respostas.put(3, "💚 O GetGreen é um projeto que incentiva práticas sustentáveis e conscientização ambiental.");
        respostas.put(4, "🖥️ Procure pontos de coleta em sua cidade ou lojas que aceitam eletrônicos para descarte correto.");
        respostas.put(5, "🪴 A coleta seletiva reduz a poluição e permite que materiais recicláveis sejam reaproveitados.");
    }

    public String montarMenu() {
        StringBuilder sb = new StringBuilder();
        sb.append("🌿 Bem-vindo ao Chatbot GetGreen!\nEscolha uma das perguntas abaixo:");
        for (Map.Entry<Integer, String> e : perguntas.entrySet()) {
            sb.append("\n").append(e.getKey()).append(" - ").append(e.getValue());
        }
        sb.append("\n0 - Sair");
        return sb.toString();
    }

    public String responder(int opcao) {
        if (respostas.containsKey(opcao)) return respostas.get(opcao);
        return "Opção inválida. 🌱";
    }
}
