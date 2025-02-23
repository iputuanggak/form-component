"use client";

import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../basic/Button";
import InputField from "../basic/Input";
import TextAreaField from "../basic/TextArea";
import SelectField from "../basic/Select";

const schema = z.object({
  name: z.string().min(1, "required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "required"),
  subject: z.string().min(1, "required"),
  messsage: z.string().min(1, "required"),
});

type FormValues = z.infer<typeof schema>;

export default function FormBlock() {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "john doe",
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    methods.reset();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <InputField
          name="name"
          label="Name"
          description="Please provide your name so we know how to address you."
          placeholder="e.g Alex Taylor"
        />
        <InputField
          name="email"
          label="Email Address"
          description="Enter a valid email address where we can reach you."
          placeholder="you@example.com"
        />
        <InputField
          name="phone"
          label="Phone Number (optional)"
          description="Include your phone number if you'd like us to call you."
          type="number"
        />
        <TextAreaField
          name="messsage"
          label="messsage"
          description="Input Your Message"
        />
           <SelectField
          name="subject"
          label="Subject"
          options={[
            { value: "option1", label: "option1" },
            { value: "option2", label: "option2" },
            { value: "option3", label: "option3" },
            { value: "option4", label: "option4" },
            { value: "option5", label: "option5" },
            { value: "option6", label: "option6" },
            { value: "option7", label: "option7" },
            { value: "option8", label: "option8" },
            { value: "option9", label: "option9" },
            { value: "option10", label: "option10" },
          
          ]}
          description="Choose the topic that best matches your inquiry."
        />
        <Button className="place-self-start">Submit</Button>
      </form>
    </FormProvider>
  );
}
