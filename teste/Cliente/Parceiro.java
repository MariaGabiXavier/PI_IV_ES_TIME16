package cliente;
import servidor.Comunicado;
import java.net.*;
import java.io.*;
import java.util.concurrent.Semaphore;


public class Parceiro {
    private Socket conexao;
    private java.io.DataInputStream receptor;
    private java.io.DataOutputStream transmissor;

    private Comunicado proximoComunicado = null;
    private Semaphore mutEx = new Semaphore(1, true);

    public Parceiro(Socket conexao) throws Exception {
        if (conexao == null) throw new Exception("Conexao ausente");
        this.conexao = conexao;
        try {
            this.receptor = new java.io.DataInputStream(this.conexao.getInputStream());
            this.transmissor = new java.io.DataOutputStream(this.conexao.getOutputStream());
        } catch (IOException e) {
            throw new Exception("Erro ao abrir streams", e);
        }
    }

    public void receba(Comunicado x) throws Exception {
        try {
            // serialize simple protocol: TYPE|payload
            if (x instanceof servidor.RespostaDeChatbot) {
                servidor.RespostaDeChatbot r = (servidor.RespostaDeChatbot) x;
                this.transmissor.writeUTF("RESP|" + r.getResposta());
            } else if (x instanceof servidor.PedidoDePergunta) {
                servidor.PedidoDePergunta p = (servidor.PedidoDePergunta) x;
                this.transmissor.writeUTF("PED|" + p.getOpcao());
            } else if (x instanceof servidor.PedidoParaSair) {
                this.transmissor.writeUTF("SAI|");
            } else if (x instanceof servidor.ComunicadoDeDesligamento) {
                this.transmissor.writeUTF("DES|");
            } else {
                // unknown type - send as text
                this.transmissor.writeUTF("MSG|unknown");
            }
            this.transmissor.flush();
        } catch (IOException erro) {
            throw new Exception("Erro de transmissao", erro);
        }
    }

    public Comunicado espie() throws Exception {
        try {
            this.mutEx.acquireUninterruptibly();
            if (this.proximoComunicado == null) {
                String s = this.receptor.readUTF();
                // parse type|payload
                String tipo = "";
                String payload = "";
                int idx = s.indexOf('|');
                if (idx >= 0) {
                    tipo = s.substring(0, idx);
                    payload = s.substring(idx + 1);
                } else {
                    tipo = s;
                }
                if ("RESP".equals(tipo) || "MSG".equals(tipo)) {
                    this.proximoComunicado = new servidor.RespostaDeChatbot(payload);
                } else if ("PED".equals(tipo)) {
                    int opc = 0;
                    try { opc = Integer.parseInt(payload); } catch (Exception e) {}
                    this.proximoComunicado = new servidor.PedidoDePergunta(opc);
                } else if ("SAI".equals(tipo)) {
                    this.proximoComunicado = new servidor.PedidoParaSair();
                } else if ("DES".equals(tipo)) {
                    this.proximoComunicado = new servidor.ComunicadoDeDesligamento();
                } else {
                    // unknown -> wrap as Resposta
                    this.proximoComunicado = new servidor.RespostaDeChatbot(s);
                }
            }
            this.mutEx.release();
            return this.proximoComunicado;
        } catch (Exception erro) {
            throw new Exception("Erro de recepcao", erro);
        }
    }

    public Comunicado envie() throws Exception {
        try {
            if (this.proximoComunicado == null) {
                String s = this.receptor.readUTF();
                String tipo = "";
                String payload = "";
                int idx = s.indexOf('|');
                if (idx >= 0) {
                    tipo = s.substring(0, idx);
                    payload = s.substring(idx + 1);
                } else {
                    tipo = s;
                }
                if ("RESP".equals(tipo) || "MSG".equals(tipo)) {
                    this.proximoComunicado = new servidor.RespostaDeChatbot(payload);
                } else if ("PED".equals(tipo)) {
                    int opc = 0;
                    try { opc = Integer.parseInt(payload); } catch (Exception e) {}
                    this.proximoComunicado = new servidor.PedidoDePergunta(opc);
                } else if ("SAI".equals(tipo)) {
                    this.proximoComunicado = new servidor.PedidoParaSair();
                } else if ("DES".equals(tipo)) {
                    this.proximoComunicado = new servidor.ComunicadoDeDesligamento();
                } else {
                    this.proximoComunicado = new servidor.RespostaDeChatbot(s);
                }
            }
            Comunicado ret = this.proximoComunicado;
            this.proximoComunicado = null;
            return ret;
        } catch (Exception erro) {
            throw new Exception("Erro de recepcao", erro);
        }
    }

    public void adeus() throws Exception {
        try {
            this.transmissor.close();
            this.receptor.close();
            this.conexao.close();
        } catch (Exception erro) {
            throw new Exception("Erro de desconexao");
        }
    }
}
