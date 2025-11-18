
import java.util.*;

public class ChatbotRegras {
    private LinkedHashMap<Integer, String> perguntas;
    private HashMap<Integer, String> respostas;

    public ChatbotRegras() {
        perguntas = new LinkedHashMap<>();
        respostas = new HashMap<>();
         perguntas.put(1, "Sobre o Getgreen");
        perguntas.put(2, "Esqueci minha senha, o que faço?");
        perguntas.put(3, "Como contratar o sistema Getgreen para minha empresa?");
        perguntas.put(4, "Como faço para me afiliar como coletor ao Getgreen?");
        perguntas.put(5, "Não consigo atribuir uma coleta para mim, o que fazer?");
        perguntas.put(6, "O token de coleta não está sendo reconhecido, o que fazer?");
        perguntas.put(7, "Fiz uma coleta, mas ela não aparece no histórico.");
        perguntas.put(8,"Como é garantida a integridade do processo de coleta?");
        perguntas.put(9, "Como são conectados os colaboradores e as empresas?");
        perguntas.put(10, "Como faço para me comunicar com o suporte técnico?");
        perguntas.put(11, "Qual a importância da coleta seletiva?");
        perguntas.put(12, "Outros");

        respostas.put(1, "O GetGreen é um projeto que incentiva práticas sustentáveis e conscientização ambiental. Para mais informações, visite a pagina sobre o GetGreen.");
        respostas.put(2, "Para mudar sua senha, vá para a página de login e clique em 'Esqueci minha senha'. Siga as instruções enviadas");
        respostas.put(3, "Para contratar o sistema Getgreen é preciso primeiro realizar o pré-cadastro no site."+"\n1. Acesse o site do Getgreen e clique em 'Começar'."+
        "\n2. Selecione a aba Empresas."+
        "\n3. Preencha o formulário de pré-cadastro com as informações da sua empresa."+
        "\nApós o envio do formulário, nossa equipe entrará em contato para dar continuidade ao processo de contratação.");
        respostas.put(4, "Para se afiliar como coletor ao Getgreen, siga os passos abaixo:"+
        "\n1. Acesse o site do Getgreen e clique em 'Começar'."+
        "\n2. Selecione a aba Coletores."+
        "\n3. Preencha o formulário de cadastro com suas informações pessoais");
        respostas.put(5, "Se você não consegue atribuir uma coleta para si mesmo, siga os passos abaixo:"+
        "\n1. Verifique se não houve nenhum problema de conexão com a internet."+
        "\n2. Certifique-se de que você está logado na sua conta de coletor."+
        "\n3. Confira se não há nenhuma restição em sua conta"+
        "\n4. Tente atualizar a página ou reautenticar-se no sistema."+
        "\nSe o problema persistir, entre em contato com o suporte técnico para assistência adicional. Estamos aqui para ajudar!");
        respostas.put(6, "Se o token de coleta não está sendo reconhecido, siga os passos abaixo:"+
        "\n1. Verifique se o token foi digitado corretamente, sem espaços extras ou erros de digitação."+
        "\n2. Certifique-se de que o token ainda está válido e não expirou."+
        "\n3. Tente reiniciar o aplicativo ou a página onde o token está sendo inserido."+
        "\n4. Se possível, tente usar o token em outro dispositivo para verificar se o problema persiste."+
        "\nSe o problema continuar, entre em contato com o suporte técnico para obter ajuda adicional.");
        respostas.put(7, "Se a coleta que você realizou não aparece no histórico, siga os passos abaixo:"+
        "\n1. Verifique sua conexão com a internet para garantir que os dados possam ser atualizados."+
        "\n2. Atualize a página ou reinicie o aplicativo para forçar a atualização do histórico."+
        "\n3. Certifique-se de que você está logado na conta correta onde a coleta foi registrada."+
        "\n4. Aguarde alguns minutos, pois pode haver um atraso na atualização do sistema."+
        "\nSe a coleta ainda não aparecer, entre em contato com o suporte técnico para assistência.");
        respostas.put(8, "A integridade do processo de coleta é garantida por meio de um sistema de rastreamento que monitora cada etapa, desde a coleta até a destinação final dos materiais."+
        "\nToda coleta é registrada no sistema por meio de um token que deve ser apresentado pelo coletor ao estabelecimento, permitindo transparência e responsabilidade.");
        respostas.put(9, "Os colaboradores e as empresas são conectados por meio de uma plataforma online onde os colaboradores podem se cadastrar como coletores e as empresas podem solicitar serviços de coleta seletiva."+
        "\nA plataforma facilita a comunicação e o agendamento das coletas, garantindo eficiência no processo.");
        respostas.put(10, "Para se comunicar com o suporte técnico, você pode utilizar os seguintes canais:"+
        "\n1. E-mail: envie suas dúvidas ou problemas para suportegetgreen@getgreen.com.br" +
        "\n2. Telefone: ligue para (11) 1234-5678, atendimento 24hrs."+
        "\n3. Telefone: ligue para (11) 3378-9023, durante o horário comercial (9hrs às 18hrs).");
        respostas.put(11, "A coleta seletiva é importante porque reduz o desperdício e permite a reciclagem de materiais.");
        respostas.put(12, "Desculpe, infelizmente não posso te ajudar por aqui!\n"+"Se você tiver outras dúvidas ou precisar de mais informações, por favor, entre em contato com nosso suporte técnico");
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
