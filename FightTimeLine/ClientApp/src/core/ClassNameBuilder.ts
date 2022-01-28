export class ClassNameBuilder {
    private classes: Array<string>;
    private changed: boolean = false;

    constructor(input: string) {
        this.classes = (input || "").split(" ");
    }

    add(input: string[]): ClassNameBuilder {
        for (let s of input) {
            if (this.classes.indexOf(s) < 0) {
                this.classes.push(s);
                this.changed = true;
            }
        }
        return this;
    }

    remove(input: string[]): ClassNameBuilder {
        for (let s of input) {
            const index = this.classes.indexOf(s);
            if (index >= 0) {
                this.classes.splice(index, 1);
                this.changed = true;
            }
        }
        return this;
    }

    toggle(input: string[]): ClassNameBuilder {
        for (let s of input) {
            const index = this.classes.indexOf(s);
            if (index >= 0)
                this.classes.splice(index, 1);
            else
                this.classes.push(s);

            this.changed = true;
        }
        return this;
    }

    set(input: { [value: string]: boolean }): ClassNameBuilder {
        for (let s in input) {
            if (input.hasOwnProperty(s)) {
                if (input[s]) {
                    this.add([s]);
                } else {
                    this.remove([s]);
                }
            }
        }
        return this;
    }

    isChanged(): boolean {
        return this.changed;
    }

    build(): string {
        return this.classes.join(" ") || "dummy";
    }
}
