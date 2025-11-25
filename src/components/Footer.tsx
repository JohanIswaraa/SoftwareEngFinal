import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, GraduationCap, BookOpen, Briefcase, Users } from 'lucide-react';
import suLogo from '@/assets/su-logo-2.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-background to-background/95 border-t border-border mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Logo and University Info */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <img 
              src={suLogo} 
              alt="Sampoerna University" 
              className="h-16 w-auto filter drop-shadow-sm"
            />
            <div className="text-center md:text-left">
              <h3 className="font-crimson font-semibold text-lg text-foreground">
                Sampoerna University
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                Career Center
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5 justify-center md:justify-start">
                <Mail className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="mailto:career.center@my.sampoernauniversity.ac.id"
                  className="hover:text-primary transition-colors break-words"
                >
                  career.center@my.sampoernauniversity.ac.id
                </a>
              </div>
              <div className="flex items-center gap-2.5 justify-center md:justify-start">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a 
                  href="tel:+622150222234"
                  className="hover:text-primary transition-colors whitespace-nowrap"
                >
                  +62 21 5022 2234
                </a>
              </div>
              <div className="flex items-start gap-2.5 justify-center md:justify-start">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed break-words">
                  <div>L'Avenue Office 6th floor</div>
                  <div>Jl. Raya Pasar Minggu Kav. 16</div>
                  <div>Pancoran, Jakarta Selatan - 12780</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="space-y-3 text-sm">
              <a 
                href="https://newgateway.sampoernaschoolssystem.com/adfs/ls?wa=wsignin1.0&wtrealm=urn:federation:devcas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 justify-center md:justify-start text-muted-foreground hover:text-primary transition-colors"
              >
                <GraduationCap className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Student Portal</span>
              </a>
              <a 
                href="https://portal.sampoernauniversity.ac.id/file/SU_Academic_Calendar.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 justify-center md:justify-start text-muted-foreground hover:text-primary transition-colors"
              >
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Academic Calendar</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="text-center text-sm text-muted-foreground space-y-1.5">
          <p>&copy; {new Date().getFullYear()} Sampoerna University. All rights reserved.</p>
          <p>Internship Portal - Connecting Students with Opportunities</p>
        </div>
      </div>
    </footer>
  );
};