import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {useState} from "react";
import {Check, ChevronsUpDown} from "lucide-react";

interface Value {
    id: string,
    name: string,
}

interface Props {
    options: Value[],
    onValueChange: (value: Value) => void,
    optionName: string
}

export function Combobox({options, onValueChange, optionName}: Props) {
    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between"
                >
                    {value
                        ? options?.find(option => option.name === value)?.name
                            : `Select ${optionName}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search option..." />
                    <CommandEmpty>{`No ${optionName} found.`}</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {options?.map((option) => {
                                return (
                                <CommandItem
                                    key={option.id}
                                    value={option.id}
                                    onSelect={(currentValue) => {
                                        const correspondingOption = options?.find((option) => option.name === currentValue)
                                        setValue(correspondingOption?.name ?? "")
                                        if(!correspondingOption) return
                                        onValueChange(correspondingOption)
                                        setOpen(false)
                                    }}
                                    className={"items-start"}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.name}
                                </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}