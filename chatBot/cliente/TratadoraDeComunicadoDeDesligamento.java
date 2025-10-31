package cliente;

import servidor.ComunicadoDeDesligamento;

public class TratadoraDeComunicadoDeDesligamento extends Thread {
    private cliente.Parceiro servidor; // usa a classe Parceiro do pacote cliente

    public TratadoraDeComunicadoDeDesligamento(cliente.Parceiro servidor) throws Exception {
        if (servidor == null) throw new Exception("Servidor invalido");
        this.servidor = servidor;
    }

    public void run() {
        for (;;) {
            try {
                // verifica se o próximo comunicado é um desligamento
                if (this.servidor.espie() instanceof ComunicadoDeDesligamento) {
                    System.out.println("\nO servidor vai ser desligado agora;");
                    System.err.println("volte mais tarde!\n");
                    System.exit(0);
                }
                // evita busy-waiting: pequena pausa antes de verificar novamente
                try { Thread.sleep(50); } catch (InterruptedException ie) {}
            } catch (Exception erro) {
                // ignora e continua esperando
            }
        }
    }
}
