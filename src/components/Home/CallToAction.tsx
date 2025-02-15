import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const CallToAction = () => {
  const navigate = useNavigate();

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-xl bg-cuba-gradient text-white py-16"
    >
      <div className="absolute inset-0 bg-golden-shimmer animate-golden-light" />
      <div className="container mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-title font-bold mb-6"
        >
          Changez une vie aujourd'hui
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-xl mb-8 max-w-2xl mx-auto"
        >
          Votre soutien fait une réelle différence dans la vie des enfants cubains
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={() => navigate("/become-sponsor")}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 transform transition-all duration-300 hover:scale-105"
          >
            Parrainer un enfant
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};