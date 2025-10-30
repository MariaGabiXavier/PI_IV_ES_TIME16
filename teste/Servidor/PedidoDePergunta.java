package servidor;
public class PedidoDePergunta extends Comunicado {
    private int opcao;

    public PedidoDePergunta(int opcao) {
        this.opcao = opcao;
    }

    public int getOpcao() {
        return opcao;
    }
}
