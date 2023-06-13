package org.akrck02;

import org.akrck02.cli.Cli;

public class GifMaker{

    public static void main(String[] args) {
        Cli cli = new Cli(Cli.argumentsFrom(args));
        cli.run();
    }
}