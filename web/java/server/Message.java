package server;

import java.io.Serializable;

// Classe base para todas as mensagens trocadas entre cliente e servidor
public abstract class Message implements Serializable {
    private static final long serialVersionUID = 1L;
}