package org.akrck02.cli;

import org.akrck02.core.GifFactory;
import org.akrck02.core.Options;

public class Cli {

    private Arguments arguments;

   public Cli() {
       this.arguments = defaultArguments();
   }

    public Cli(Arguments arguments) {
         this.arguments = arguments;
    }


    public static Arguments defaultArguments() {
        return new Arguments(new String[] {});
    }

    public static void main(String[] args) {
        Cli cli = new Cli();
        cli.run();
    }

    public static Arguments argumentsFrom(String[] args) {
        return new Arguments(args);
    }

    public void run() {
        Options options = new Options();

        if (arguments.get("width") != null) {
            options.setWidth(Integer.parseInt(arguments.get("width")));
        }

        if (arguments.get("height") != null) {
            options.setHeight(Integer.parseInt(arguments.get("height")));
        }

        if (arguments.get("delay") != null) {
            options.setDelay(Integer.parseInt(arguments.get("delay")));
        }

        if (arguments.get("name") != null) {
            options.setOutputName(arguments.get("name"));
        }

        if (arguments.get("input") != null) {
            options.setInputPath(arguments.get("input"));
        }

        if (arguments.get("output") != null) {
            options.setOutputPath(arguments.get("output"));
        }

        GifFactory.create(options);
    }



}
